# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# =============================================================================
# BIOGUARD AI - PRODUCTION PROGUARD RULES
# =============================================================================

# Keep application class
-keep class com.bioguard.ai.MainActivity { *; }

# -----------------------------------------------------------------------------
# Capacitor / Cordova Rules
# -----------------------------------------------------------------------------
-keep class com.getcapacitor.** { *; }
-keep class org.apache.cordova.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep plugin interfaces
-keep interface * extends org.apache.cordova.CordovaPlugin { *; }

# -----------------------------------------------------------------------------
# Firebase / Google Play Services Rules
# -----------------------------------------------------------------------------
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Prevent R8 from removing Firebase classes
-keep class com.google.firebase.auth.** { *; }
-keep class com.google.firebase.firestore.** { *; }
-keep class com.google.firebase.storage.** { *; }

# Keep Gson serialization classes
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }

# -----------------------------------------------------------------------------
# AndroidX / AppCompat Rules
# -----------------------------------------------------------------------------
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Keep AppCompat specific classes
-keep class android.support.v7.** { *; }
-keep class android.support.design.** { *; }

# -----------------------------------------------------------------------------
# WebView / JavaScript Interface Rules
# -----------------------------------------------------------------------------
# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView clients
-keep class * extends android.webkit.WebViewClient { *; }
-keep class * extends android.webkit.WebChromeClient { *; }

# -----------------------------------------------------------------------------
# Kotlin / Coroutines Rules
# -----------------------------------------------------------------------------
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}

# -----------------------------------------------------------------------------
# General Android Rules
# -----------------------------------------------------------------------------
# Preserve line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name
-renamesourcefileattribute SourceFile

# Prevent stripping of system API classes
-keep class * extends android.app.Activity { *; }
-keep class * extends android.app.Application { *; }
-keep class * extends android.app.Service { *; }
-keep class * extends android.content.BroadcastReceiver { *; }
-keep class * extends android.content.ContentProvider { *; }

# Keep custom view constructors
-keepclasseswithmembers class * {
    <init>(android.content.Context, android.util.AttributeSet);
}

-keepclasseswithmembers class * {
    <init>(android.content.Context, android.util.AttributeSet, int);
}

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# -----------------------------------------------------------------------------
# Optimization Rules
# -----------------------------------------------------------------------------
# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int d(...);
    public static int i(...);
}

# Optimize: remove unused classes and methods
-optimizationpasses 5
-allowaccessmodification
-dontpreverify
