# Recent Changes - TBC Decatur Customizations

## Summary of Changes Made

### ✅ 1. Dark Mode Support (Auto-Detects System Theme)

**What changed:**
- App now automatically detects your system's dark/light mode preference
- Added theme toggle button (🌙/☀️) in the top-right corner
- All colors adapt to the selected theme
- Theme preference is saved and remembered between sessions

**How it works:**
- Opens in dark mode if your system is set to dark
- Opens in light mode if your system is set to light
- Click the moon/sun icon to manually switch themes
- Your choice is saved in localStorage

**Files modified:**
- `frontend/src/App.jsx` - Added theme state and toggle function
- `frontend/src/index.css` - Added dark theme color variables
- `frontend/src/App.css` - Added theme toggle button styles

### ✅ 2. Default Bible Translation Changed to CSB

**What changed:**
- All Bible Gateway links now open in CSB (Christian Standard Bible) instead of NIV
- When you click "Read →" or "Read All Passages", it opens CSB version

**How it works:**
- Changed default parameter in `openBibleGateway` function from 'NIV' to 'CSB'
- Bible Gateway URL now includes `&version=CSB`

**Files modified:**
- `frontend/src/App.jsx` - Line 79: `version = 'CSB'`

### ✅ 3. Updated Subtitle for TBC Decatur

**What changed:**
- Old subtitle: "Read through the entire Bible"
- New subtitle: "A TBC Decatur study together,<br />Love God, Love People, and Make Disciples."

**How it displays:**
```
A TBC Decatur study together,
Love God, Love People, and Make Disciples.
```

**Files modified:**
- `frontend/src/App.jsx` - Lines 116-119
- `frontend/src/App.css` - Updated subtitle styling for better line spacing

### ✅ 4. Remembers Your Plan Selection

**What changed:**
- Default plan changed from 1-year to 2-year (24_month)
- When you select a plan, it's saved to localStorage
- Next time you open the app, it remembers your last selection

**How it works:**
- First visit: Opens with 2-year plan
- User selects 4-year plan: Saved to localStorage
- Next visit: Opens with 4-year plan (remembered)
- Works across sessions, devices (same browser), and mobile

**Files modified:**
- `frontend/src/App.jsx` - Added localStorage save/load for selectedPlan

## Answer to Your Question #4

**Q: "If someone is using this on a mobile device and wants to focus on the 2-year plan, will the next time this is opened start with the 2-year plan or will it always offer the 1-year plan?"**

**A: YES! It will remember the 2-year plan!** ✅

The app now:
1. **Defaults to 2-year plan** for first-time users
2. **Saves your choice** whenever you select a different plan
3. **Remembers it next time** you open the app (even on mobile)
4. **Persists across sessions** - close the app, come back tomorrow, it's still there
5. **Works per-device** - if you use it on phone and laptop, each remembers separately

Example flow:
```
Day 1 (Mobile): Opens → Shows 2-year plan (default)
User clicks → Switches to 4-year plan → Saved!

Day 2 (Mobile): Opens → Shows 4-year plan (remembered!)

Day 3 (Desktop): Opens → Shows 2-year plan (default for new device)
User clicks → Switches to 4-year plan → Saved!
```

## Technical Details

### Theme Detection Logic
```javascript
// Auto-detect system theme
const [theme, setTheme] = useState(() => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
});
```

### Plan Memory Logic
```javascript
// Remember selected plan
const [selectedPlan, setSelectedPlan] = useState(() => {
  const saved = localStorage.getItem('selectedPlan');
  return saved || '24_month'; // Default to 2-year
});

// Save when changed
useEffect(() => {
  localStorage.setItem('selectedPlan', selectedPlan);
}, [selectedPlan]);
```

### CSB Translation
```javascript
const openBibleGateway = (passage, version = 'CSB') => {
  const url = `https://www.biblegateway.com/passage/?search=${passage}&version=${version}`;
  window.open(url, '_blank');
};
```

## Testing the Changes

### Test Dark Mode
1. Check your system settings (Windows Settings → Personalization → Colors → Choose your mode)
2. Set to "Dark"
3. Open the app - should be dark
4. Click the moon icon → switches to light
5. Refresh page → stays light (remembered!)

### Test Plan Memory
1. Open app → Note which plan is selected (should be 2-year)
2. Click on 4-year plan
3. Close the tab completely
4. Open the app again → Should open with 4-year plan selected!

### Test CSB Translation
1. Open app
2. Click "Read →" on any passage
3. Look at Bible Gateway URL - should say `version=CSB`
4. Should display Christian Standard Bible

### Test Mobile
1. Open on phone
2. Select a plan
3. Close browser completely
4. Open app again
5. Should remember your plan choice

## Future Enhancements (Not Yet Implemented)

For when you want to add the TBC Decatur logo:

```javascript
// In App.jsx header section, add:
<div className="header-logo">
  <img src="/tbc-logo.png" alt="TBC Decatur" />
</div>
```

```css
/* In App.css */
.header-logo img {
  max-height: 60px;
  margin-bottom: 1rem;
}
```

Just place the logo file in `frontend/public/tbc-logo.png` and add the code above!

## Files Changed Summary

1. ✅ `frontend/src/App.jsx` - Main application logic
   - Added theme state and toggle
   - Changed default to 2-year plan
   - Added plan memory
   - Changed CSB default
   - Updated subtitle

2. ✅ `frontend/src/index.css` - Global styles
   - Added dark theme color variables

3. ✅ `frontend/src/App.css` - Component styles
   - Added theme toggle button
   - Updated header layout
   - Updated subtitle styling

## All Requested Changes Complete! ✅

1. ✅ Dark mode with system theme detection
2. ✅ CSB as default translation
3. ✅ TBC Decatur subtitle updated
4. ✅ Plan selection remembered across sessions

Ready to test! Just start the dev server:
```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 and enjoy! 🎉
