# MemoryVault - Personal Journaling Application

## Project Overview

**Project Name:** MemoryVault
**Project Type:** Full-stack Web Application
**Core Functionality:** A secure personal journaling platform where users can create accounts, write journal entries with photos, view past entries, manage trash with 30-day expiration, and export their data.
**Target Users:** Individuals who want to keep a digital diary with photos, memories, and personal reflections.

---

## UI/UX Specification

### Design Inspiration

Based on Feastria restaurant website aesthetics:

- Bold, expressive typography
- Warm, inviting color palette (amber, coral, cream tones)
- Smooth scroll animations and transitions
- Card-based layouts with subtle shadows
- Image-focused design
- Modern, clean sections

### Color Palette

| Role           | Color      | Hex Code  |
| -------------- | ---------- | --------- |
| Primary        | Warm Amber | `#E8A838` |
| Primary Dark   | Deep Amber | `#C78B2E` |
| Secondary      | Coral      | `#E85A4F` |
| Accent         | Cream      | `#FDF6E3` |
| Background     | Off-White  | `#FEFBF5` |
| Surface        | White      | `#FFFFFF` |
| Text Primary   | Charcoal   | `#2D2A26` |
| Text Secondary | Warm Gray  | `#6B6560` |
| Text Muted     | Light Gray | `#9E9891` |
| Border         | Light Tan  | `#E8E2D9` |
| Success        | Sage Green | `#5B8A5B` |
| Error          | Soft Red   | `#D64545` |
| Trash/Delete   | Dusty Rose | `#C47070` |

### Typography

| Element     | Font             | Weight | Size |
| ----------- | ---------------- | ------ | ---- |
| Logo/Brand  | Playfair Display | 700    | 32px |
| Headings H1 | Playfair Display | 600    | 48px |
| Headings H2 | Playfair Display | 600    | 36px |
| Headings H3 | Playfair Display | 500    | 28px |
| Body        | DM Sans          | 400    | 16px |
| Body Small  | DM Sans          | 400    | 14px |
| Labels      | DM Sans          | 500    | 12px |
| Buttons     | DM Sans          | 600    | 14px |

### Spacing System

- Base unit: 8px
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px
- XXXL: 64px

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visual Effects

- Border radius (cards): 16px
- Border radius (buttons): 12px
- Border radius (inputs): 10px
- Box shadow (cards): `0 4px 20px rgba(45, 42, 38, 0.08)`
- Box shadow (hover): `0 8px 30px rgba(45, 42, 38, 0.12)`
- Box shadow (elevated): `0 12px 40px rgba(45, 42, 38, 0.15)`

---

## Page Structure

### 1. Landing Page (index.html)

- Hero section with brand statement and CTA
- Features preview (3 cards)
- Testimonial/quote section
- Footer with links

### 2. Authentication Pages

- **Login (login.html)** - Email/password form
- **Register (register.html)** - Username/email/password form with confirm

### 3. Dashboard (dashboard.html)

- Sidebar navigation
- Welcome header with user name
- Recent entries grid (last 6)
- Quick stats (total entries, photos, days active)
- Quick action buttons

### 4. Journal Entries List (entries.html)

- Sidebar navigation
- Search bar
- Filter dropdown (date, has photos)
- Entries grid with cards
- Pagination
- "New Entry" floating button

### 5. Create/Edit Entry (entry-form.html)

- Sidebar navigation
- Title input
- Rich text area for content
- Photo upload section with drag & drop
- Photo gallery preview
- Save/Cancel buttons
- Delete button (edit mode)

### 6. Single Entry View (entry-view.html)

- Sidebar navigation
- Back button
- Entry card with full content
- Photo gallery (lightbox capable)
- Edit button
- Delete button

### 7. Trash/Bin (trash.html)

- Sidebar navigation
- Warning banner (30-day notice)
- Deleted entries list
- Restore button per entry
- Permanent delete button per entry
- Empty trash button
- Bulk actions

### 8. Settings (settings.html)

- Sidebar navigation
- Profile section (edit username/email)
- Export data section
  - Copy all text button
  - Download all images (zip)
- Danger zone (delete account)

---

## Components Specification

### Navigation Sidebar

- Logo at top
- Nav items: Dashboard, Entries, Trash, Settings
- Active state: amber background, bold text
- Hover: light amber background
- User avatar and logout at bottom

### Entry Card

- Date label (top right)
- Title (truncated to 1 line)
- Preview text (truncated to 3 lines)
- Photo indicator if has photos
- Hover: elevate with shadow

### Photo Thumbnail

- Square aspect ratio
- Object-fit: cover
- Border radius: 8px
- Hover: scale 1.02

### Buttons

- Primary: Amber background, dark text
- Secondary: Transparent, amber border
- Danger: Dusty rose background
- Disabled: Gray, reduced opacity

### Modal (Confirm Delete)

- Centered overlay
- White card with shadow
- Icon (warning)
- Message text
- Cancel (secondary) + Confirm (danger) buttons

### Toast Notifications

- Bottom right position
- Success: Green left border
- Error: Red left border
- Auto-dismiss after 4 seconds
- Slide-in animation

### Form Inputs

- Border: 2px solid border color
- Focus: Amber border, subtle glow
- Error: Red border
- Label above input

---

## Functionality Specification

### 1. Authentication System

**Registration:**

- Username (3-20 chars, alphanumeric + underscore)
- Email (valid format, unique)
- Password (min 8 chars)
- Confirm password
- Server-side validation
- Password hashed with bcrypt (salt rounds: 12)

**Login:**

- Email + password
- JWT token stored in localStorage
- Token expiry: 7 days
- Auto-login on token present

**Security:**

- Passwords never stored in plain text
- JWT tokens signed with secret key
- Protected routes require valid token

### 2. Journal Entry Management

**Create Entry:**

- Title (required, max 200 chars)
- Content (required, rich text/markdown)
- Photos (optional, max 10 per entry)
- Auto-save draft every 30 seconds
- Created timestamp auto-recorded

**Read Entry:**

- Full content display
- Photo gallery with lightbox
- Created and modified dates

**Update Entry:**

- All fields editable
- Modified timestamp updated
- Soft update (no new version)

**Delete Entry (to Trash):**

- Confirmation modal required
- Entry moved to trash
- Original deletion date recorded
- 30 days to restore

**Permanent Delete:**

- Confirmation modal required
- Requires re-authentication for bulk delete
- Photos deleted from filesystem

### 3. Photo Management

**Upload:**

- Accepted formats: jpg, jpeg, png, webp, gif
- Max file size: 10MB per image
- Max images per entry: 10
- Drag & drop support
- Click to browse

**Storage:**

- Photos stored in /uploads/{userId}/
- Filename: {timestamp}-{random}.{ext}
- Thumbnail generation (300px)
- Full size optimized

**Display:**

- Grid view in entry
- Lightbox for full view
- Delete per photo

### 4. Trash/Bin System

**Delete Duration:**

- 30 days from deletion
- Countdown displayed per entry
- Expired entries auto-deleted on login

**Restore:**

- Single click restore
- Returns to main entries
- Original position or end of list

**Permanent Delete:**

- Individual or bulk
- Cannot be undone warning
- Final confirmation

### 5. Export Features

**Copy All Text:**

- Generate plain text file content
- Format: {date} - {title}\n{content}\n\n
- Copy to clipboard
- Download as .txt file

**Download Images (ZIP):**

- All user photos in zip
- Organized by entry date folders
- Filename: MemoryVault-Images-{date}.zip
- Uses JSZip library

### 6. Search and Filter

**Search:**

- Search by title
- Search by content
- Real-time results

**Filter:**

- By date range
- By has photos
- By in trash / not in trash

---

## Animation Specification

### Page Load Animations

- Staggered fade-in for cards (100ms delay each)
- Slide up from 20px below
- Duration: 400ms ease-out

### Scroll Animations

- Elements animate in when 20% visible
- Fade + slide up 10px
- Duration: 300ms

### Hover Animations

- Cards: scale 1.02, shadow increase
- Buttons: background darken
- Links: underline slide-in
- Duration: 200ms ease

### Modal Animations

- Overlay: fade in 200ms
- Card: scale from 0.9 + fade
- Duration: 250ms ease-out

### Toast Animations

- Slide in from right
- Fade out for dismiss
- Duration: 300ms

### Page Transitions

- Fade out current: 150ms
- Fade in new: 250ms

### Button Interactions

- Press: scale 0.98
- Duration: 100ms

---

## API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Entries

```
GET    /api/entries
GET    /api/entries/:id
POST   /api/entries
PUT    /api/entries/:id
DELETE /api/entries/:id
```

### Trash

```
GET  /api/trash
POST /api/trash/:id/restore
DELETE /api/trash/:id/permanent
DELETE /api/trash/empty
```

### Photos

```
POST   /api/entries/:id/photos
DELETE /api/photos/:id
GET    /api/photos/:id/download
```

### Export

```
GET /api/export/text
GET /api/export/images
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Entries Table

```sql
CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Photos Table

```sql
CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entry_id) REFERENCES entries(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## File Structure

```
/Users/diamondelite/test/
├── package.json
├── server.js
├── database.js
├── routes/
│   ├── auth.js
│   ├── entries.js
│   ├── trash.js
│   └── export.js
├── middleware/
│   └── auth.js
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── entries.html
│   ├── entry-form.html
│   ├── entry-view.html
│   ├── trash.html
│   ├── settings.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── entries.js
│   │   ├── photos.js
│   │   └── export.js
│   └── images/
│       └── (placeholder)
└── uploads/
    └── (user uploads)
```

---

## Acceptance Criteria

### Authentication

- [ ] User can register with username, email, password
- [ ] User can login with email and password
- [ ] Invalid credentials show error message
- [ ] Logged in user can logout
- [ ] Protected pages redirect to login

### Journal Entries

- [ ] User can create new entry with title, content
- [ ] User can view list of entries
- [ ] User can view single entry
- [ ] User can edit entry
- [ ] User can delete entry (moves to trash)
- [ ] Entries show date and preview

### Photos

- [ ] User can upload photos to entry
- [ ] Photos display in entry view
- [ ] User can delete individual photos
- [ ] Photos open in lightbox

### Trash

- [ ] Deleted entries appear in trash
- [ ] Trash shows days until permanent delete
- [ ] User can restore entry from trash
- [ ] User can permanently delete entry
- [ ] Entries auto-delete after 30 days

### Export

- [ ] Copy all text copies to clipboard
- [ ] Download images creates zip file
- [ ] Export works for all user data

### Animations

- [ ] Page load animations work
- [ ] Scroll animations trigger
- [ ] Hover animations smooth
- [ ] Modal animations present

### Responsive

- [ ] Works on mobile
- [ ] Works on tablet
- [ ] Works on desktop
