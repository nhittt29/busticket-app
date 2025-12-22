pluginManagement {
    val flutterSdkPath =
        run {
            val properties = java.util.Properties()
            file("local.properties").inputStream().use { properties.load(it) }
            val flutterSdkPath = properties.getProperty("flutter.sdk")
            require(flutterSdkPath != null) { "flutter.sdk not set in local.properties" }
            flutterSdkPath
        }

    includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    // Plugin Flutter
    id("dev.flutter.flutter-plugin-loader")

    // ✅ Bổ sung version cho plugin Android
    id("com.android.application") version "8.6.0" apply false

    // ✅ Bổ sung version cho plugin Kotlin Android
    id("org.jetbrains.kotlin.android") version "1.9.24" apply false

    // ✅ Bổ sung plugin Google Services (Firebase)
    id("com.google.gms.google-services") version "4.4.3" apply false
}

include(":app")
