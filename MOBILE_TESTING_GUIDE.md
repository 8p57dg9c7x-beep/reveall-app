# 📱 CINESCAN Mobile Testing Guide

## 🎯 Quick Start

### Option 1: Web Preview (Instant)
Access the app directly in your browser:
- **URL**: https://smart-closet-36.preview.emergentagent.com
- Works on desktop and mobile browsers
- No installation required

### Option 2: Expo Go App (Recommended for Real Device Testing)

#### Step 1: Install Expo Go
- **iOS**: Download from App Store
- **Android**: Download from Google Play Store
- Search for "Expo Go"

#### Step 2: Get QR Code
The app is running on Expo's tunnel system. To get the QR code:

1. Check the Expo logs:
```bash
tail -100 /var/log/supervisor/expo.out.log | grep -A 10 "Tunnel ready"
```

2. Or access the Expo dev tools:
- Open: http://localhost:3000 (if you have local access)
- The QR code will be displayed there

#### Step 3: Scan QR Code
- **iOS**: Open Camera app and scan the QR code
- **Android**: Open Expo Go app and use built-in QR scanner

## 🧪 Testing Checklist

### Home Screen
- [ ] Purple-pink gradient displays correctly
- [ ] CINESCAN title is visible and styled correctly
- [ ] Film icon appears
- [ ] "Identify" button is touchable and styled correctly
- [ ] "My Watchlist" button is touchable and styled correctly
- [ ] Buttons respond to touch (press effect)

### Identify Screen - Image Mode
- [ ] Can navigate from Home → Identify
- [ ] Three mode buttons (Image/Audio/Video) display correctly
- [ ] Clicking "Image" shows camera/gallery options
- [ ] "Take Photo" button requests camera permission
- [ ] Camera opens correctly (on real device)
- [ ] Photo is captured and preview shown
- [ ] "Choose from Gallery" button requests photo permission
- [ ] Gallery opens correctly
- [ ] Selected image preview displays
- [ ] "Identify Movie" button appears
- [ ] Back navigation works

### Identify Screen - Audio Mode
- [ ] Clicking "Audio" shows record/upload options
- [ ] "Record Audio" requests microphone permission
- [ ] Recording starts with visual indicator
- [ ] Recording timer shows (if implemented)
- [ ] "Stop Recording" works
- [ ] Recorded audio file name displays
- [ ] "Upload Audio File" opens file picker
- [ ] "Identify Movie" button appears after file selection

### Identify Screen - Video Mode
- [ ] Clicking "Video" shows upload option
- [ ] "Upload Video" opens file picker
- [ ] Video file selection works
- [ ] File name displays after selection
- [ ] "Identify Movie" button appears

### Result Screen (After Backend Integration)
- [ ] Movie poster loads and displays correctly
- [ ] Movie title displays
- [ ] Year displays correctly
- [ ] Rating (⭐ x/10) displays
- [ ] Runtime displays (if available)
- [ ] Genre tags display correctly
- [ ] Overview text is readable and scrollable
- [ ] "Add to Watchlist" button works
- [ ] "Search Again" button navigates back
- [ ] Success message shows when added to watchlist
- [ ] "Already in watchlist" message if duplicate

### Watchlist Screen
- [ ] Empty state displays correctly when no movies saved
- [ ] Film icon appears
- [ ] "Your watchlist is empty" message displays
- [ ] "Identify Movies" button works and navigates
- [ ] Movies display in 2-column grid (when items exist)
- [ ] Movie posters load correctly
- [ ] Movie title, year, rating display on cards
- [ ] Tapping movie card opens detail view
- [ ] Remove button appears on cards
- [ ] Remove confirmation dialog appears
- [ ] Movie is removed after confirmation
- [ ] Grid updates after removal

### Navigation
- [ ] Home → Identify works
- [ ] Home → Watchlist works
- [ ] Identify → Back to Home works
- [ ] Watchlist → Back to Home works
- [ ] Result → Search Again → Identify works
- [ ] Watchlist → Movie Details works

### Permissions (Real Device Only)
- [ ] Camera permission request shows custom message
- [ ] Microphone permission request shows custom message
- [ ] Photo library permission request shows custom message
- [ ] App handles permission denial gracefully
- [ ] Settings button appears when permission denied (iOS)

### Performance
- [ ] App loads quickly
- [ ] Gradient renders smoothly
- [ ] Navigation transitions are smooth
- [ ] Images load without lag
- [ ] No visible UI glitches
- [ ] Touch responses are immediate

### Error Handling (After Backend Integration)
- [ ] Network error shows user-friendly message
- [ ] No movie found shows appropriate message
- [ ] Loading spinner appears during API calls
- [ ] Loading message is clear
- [ ] Timeout handled gracefully
- [ ] Large file upload warning (if applicable)

## 🐛 Common Issues & Solutions

### Issue: QR Code Not Working
**Solution**: 
- Ensure your phone is on the same network (or use Expo tunnel)
- Try refreshing the Expo dev tools
- Check if the URL is accessible in your phone's browser first

### Issue: Camera/Microphone Not Working
**Solution**:
- Check app permissions in phone settings
- Expo Go must have camera/mic permissions
- On iOS, check Settings → Expo Go → Permissions
- On Android, check Settings → Apps → Expo Go → Permissions

### Issue: Images Not Loading
**Solution**:
- Check internet connection
- Verify TMDB image URLs are accessible
- Check console logs for errors

### Issue: "Module not found" Error
**Solution**:
- Restart Expo server: `sudo supervisorctl restart expo`
- Clear Metro cache if needed
- Reinstall dependencies if required

## 📊 Backend Integration Status

### Currently Working (No Backend Needed):
✅ All UI screens
✅ Navigation
✅ Watchlist (local storage)
✅ File selection interfaces
✅ Permission requests

### Requires Backend URL:
⏳ Movie identification from images
⏳ Movie identification from audio
⏳ Movie identification from video
⏳ Movie metadata display
⏳ API error handling

## 🔗 Useful Links

- **Web Preview**: https://smart-closet-36.preview.emergentagent.com
- **Home Screen**: https://smart-closet-36.preview.emergentagent.com/
- **Identify Screen**: https://smart-closet-36.preview.emergentagent.com/identify
- **Watchlist Screen**: https://smart-closet-36.preview.emergentagent.com/watchlist

## 📝 Testing Notes

### Browser Testing (Web Preview)
- ✅ Basic UI testing works
- ⚠️ Camera/microphone may not work in browser
- ⚠️ File uploads work differently than mobile
- ✅ Good for quick UI verification

### Expo Go Testing (Real Device)
- ✅ All features work natively
- ✅ Camera/microphone work properly
- ✅ True mobile experience
- ✅ Best for comprehensive testing
- ⚠️ Requires Expo Go app installation

## 🚀 Ready for Production Testing

Once backend URL is provided:
1. Update EXPO_PUBLIC_BACKEND_URL in .env
2. Restart Expo service
3. Test full movie identification flow
4. Test error scenarios
5. Test with poor network conditions
6. Test on multiple devices (iOS + Android)
7. Verify all permissions work
8. Check AsyncStorage persistence
9. Test app state management
10. Final UX polish

---

**Note**: The app is currently running in development mode. For production deployment, you'll need to build the app using EAS Build for App Store and Google Play Store submission.
