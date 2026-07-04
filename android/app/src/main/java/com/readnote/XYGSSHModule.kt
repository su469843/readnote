package com.readnote

import android.util.Log
import com.facebook.react.bridge.*
import com.jcraft.jsch.*
import java.io.ByteArrayOutputStream
import java.io.InputStream

class XYGSSHModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var session: Session? = null
    private var connected = false

    override fun getName(): String = "XYGSSH"

    @ReactMethod
    fun connect(
        host: String,
        port: Int,
        username: String,
        password: String,
        privateKey: String,
        authType: String,
        promise: Promise
    ) {
        try {
            val jsch = JSch()
            var sshSession: Session

            if (authType == "key" && privateKey.isNotBlank()) {
                jsch.addIdentity("ssh_key", privateKey.toByteArray(), null, null)
                sshSession = jsch.getSession(username, host, port)
            } else {
                sshSession = jsch.getSession(username, host, port)
                sshSession.setPassword(password)
            }

            // 跳过主机密钥检查（自用工具简化处理）
            sshSession.setConfig("StrictHostKeyChecking", "no")

            // 连接超时 15 秒
            sshSession.connect(15000)
            session = sshSession
            connected = true

            promise.resolve(true)
        } catch (e: JSchException) {
            connected = false
            Log.e(TAG, "SSH 连接失败: ${e.message}")
            promise.reject("SSH_ERROR", "连接失败: ${e.message}")
        } catch (e: Exception) {
            connected = false
            Log.e(TAG, "SSH 异常: ${e.message}")
            promise.reject("SSH_ERROR", "连接异常: ${e.message}")
        }
    }

    @ReactMethod
    fun execCommand(command: String, promise: Promise) {
        if (!connected || session == null) {
            promise.reject("SSH_ERROR", "未连接到服务器")
            return
        }

        try {
            val sshSession = session!!
            val channel = sshSession.openChannel("exec") as ChannelExec
            channel.setCommand(command)

            // 设置终端类型和尺寸
            channel.setPtyType("xterm-256color")
            channel.setPtySize(120, 40, 0, 0)

            // 合并 stdout 和 stderr
            val outputStream = ByteArrayOutputStream()
            val errStream = ByteArrayOutputStream()

            val inputStream: InputStream = channel.getInputStream()
            val errInputStream: InputStream = channel.getErrStream()

            channel.connect()

            // 读取 stdout
            val buf = ByteArray(1024)
            while (true) {
                val len = inputStream.read(buf)
                if (len <= 0) break
                outputStream.write(buf, 0, len)
            }

            // 读取 stderr
            while (true) {
                val len = errInputStream.read(buf)
                if (len <= 0) break
                errStream.write(buf, 0, len)
            }

            channel.disconnect()

            val exitCode = channel.exitStatus
            val result = WritableNativeMap().apply {
                putString("stdout", outputStream.toString("UTF-8"))
                putString("stderr", errStream.toString("UTF-8"))
                putInt("exitCode", exitCode)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "命令执行失败: ${e.message}")
            promise.reject("SSH_ERROR", "命令执行失败: ${e.message}")
        }
    }

    @ReactMethod
    fun isConnected(promise: Promise) {
        promise.resolve(connected && session?.isConnected == true)
    }

    @ReactMethod
    fun disconnect(promise: Promise) {
        try {
            session?.disconnect()
            connected = false
            session = null
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SSH_ERROR", "断开连接失败: ${e.message}")
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        try {
            session?.disconnect()
        } catch (_: Exception) {}
        connected = false
        session = null
    }

    companion object {
        private const val TAG = "XYGSSH"
    }
}
