package com.xyg.notes

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import com.facebook.react.bridge.*
import java.util.Locale
import java.util.concurrent.Executors

class XYGTTSModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var tts: TextToSpeech? = null
    private var audioTrack: AudioTrack? = null
    private val executor = Executors.newSingleThreadExecutor()
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
            stopAudio()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("TTS_ERROR", "停止朗读失败: ${e.message}")
        }
    }

    @ReactMethod
    fun playAudio(audioData: ReadableArray, promise: Promise) {
        executor.execute {
            try {
                stopAudio()
                val bytes = ByteArray(audioData.size())
                for (i in 0 until audioData.size()) {
                    bytes[i] = audioData.getInt(i).toByte()
                }

                val bufferSize = AudioTrack.getMinBufferSize(
                    24000,
                    AudioFormat.CHANNEL_OUT_MONO,
                    AudioFormat.ENCODING_PCM_16BIT
                )

                audioTrack = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setSampleRate(24000)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .build()
                    )
                    .setBufferSizeInBytes(bufferSize)
                    .setTransferMode(AudioTrack.MODE_STATIC)
                    .build()

                audioTrack?.write(bytes, 0, bytes.size)
                audioTrack?.play()

                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("AUDIO_ERROR", "音频播放失败: ${e.message}")
            }
        }
    }

    private fun stopAudio() {
        try {
            audioTrack?.stop()
            audioTrack?.release()
            audioTrack = null
        } catch (e: Exception) {
            Log.w(TAG, "停止音频播放失败: ${e.message}")
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        tts?.stop()
        tts?.shutdown()
        stopAudio()
        executor.shutdown()
    }

    companion object {
        private const val TAG = "XYGTTS"
    }
}