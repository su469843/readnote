package com.xyg.notes

import android.media.MediaPlayer
import android.media.AudioAttributes
import android.speech.tts.TextToSpeech
import android.util.Log
import com.facebook.react.bridge.*
import java.io.File
import java.util.Locale

class XYGTTSModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var tts: TextToSpeech? = null
    private var mediaPlayer: MediaPlayer? = null
    private var isTtsInitialized = false

    override fun getName(): String = "XYGTTS"

    init {
        initializeTTS()
    }

    private fun initializeTTS() {
        tts = TextToSpeech(reactApplicationContext) { status ->
            isTtsInitialized = status == TextToSpeech.SUCCESS
            if (isTtsInitialized) {
                val result = tts?.setLanguage(Locale.CHINESE)
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts?.setLanguage(Locale.US)
                    Log.w(TAG, "中文 TTS 不可用，回退到英语")
                }
            } else {
                Log.e(TAG, "TTS 初始化失败")
            }
        }
    }

    @ReactMethod
    fun speak(text: String, promise: Promise) {
        if (!isTtsInitialized || tts == null) {
            promise.reject("TTS_ERROR", "TTS 引擎未初始化")
            return
        }

        try {
            val utteranceId = "xyg_tts_${System.currentTimeMillis()}"
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("TTS_ERROR", "TTS 朗读失败: ${e.message}")
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            tts?.stop()
            stopMediaPlayer()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("TTS_ERROR", "停止朗读失败: ${e.message}")
        }
    }

    /**
     * 播放 MP3 音频文件（Edge TTS 返回的 MP3）
     */
    @ReactMethod
    fun playAudioFile(filePath: String, promise: Promise) {
        try {
            stopMediaPlayer()

            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("AUDIO_ERROR", "音频文件不存在: $filePath")
                return
            }

            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                )
                setDataSource(filePath)
                setOnPreparedListener { mp ->
                    mp.start()
                }
                setOnCompletionListener { mp ->
                    mp.release()
                    mediaPlayer = null
                    // 清理临时文件
                    file.delete()
                }
                setOnErrorListener { mp, what, extra ->
                    Log.e(TAG, "MediaPlayer error: what=$what extra=$extra")
                    mp.release()
                    mediaPlayer = null
                    file.delete()
                    false
                }
                prepareAsync()
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("AUDIO_ERROR", "音频播放失败: ${e.message}")
        }
    }

    private fun stopMediaPlayer() {
        try {
            mediaPlayer?.apply {
                if (isPlaying) stop()
                release()
            }
            mediaPlayer = null
        } catch (e: Exception) {
            Log.w(TAG, "停止 MediaPlayer 失败: ${e.message}")
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        tts?.stop()
        tts?.shutdown()
        stopMediaPlayer()
    }

    companion object {
        private const val TAG = "XYGTTS"
    }
}