export default {
  expo: {
    name: "REVEAL",
    slug: "reveal",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "reveal",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    updates: {
      url: "https://u.expo.dev/44522b56-4fb8-41cc-847c-bc621e161e2c"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#667eea"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.reveal.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "REVEAL needs camera access to identify movies and outfits",
        NSMicrophoneUsageDescription: "REVEAL needs microphone access to identify songs",
        NSPhotoLibraryUsageDescription: "REVEAL needs photo access to identify items from your images"
      }
    },
    android: {
      package: "com.reveal.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#667eea"
      },
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES",
        "READ_MEDIA_VIDEO",
        "READ_MEDIA_AUDIO"
      ],
      edgeToEdgeEnabled: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static"
          }
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#667eea"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "REVEAL needs photo access to identify items from your images",
          cameraPermission: "REVEAL needs camera access to identify movies and outfits"
        }
      ],
      [
        "expo-av",
        {
          microphonePermission: "REVEAL needs microphone access to identify songs"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8001",
      buildVersion: "v1.0.0",
      eas: {
        projectId: "44522b56-4fb8-41cc-847c-bc621e161e2c"
      }
    }
  }
};
