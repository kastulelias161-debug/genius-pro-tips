# Genius Tips - Football Betting Tips Website

A responsive website for football betting tips with admin panel functionality.

## Features

- **Homepage**: 2x2 grid layout with four main sections
- **Tips Pages**: Individual pages for Today, Weekly, Monthly, and Train tips
- **Admin Panel**: Content management system for adding, editing, and deleting tips
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Clean UI**: Football-inspired design with green, white, black, and gold colors

## File Structure

```
Genius Pro TIPS/
├── index.html          # Homepage
├── tips.html           # Individual tips page
├── styles.css          # All styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Setup Instructions

### 1. Basic Setup (Current Implementation)
The website is ready to use with mock data. Simply open `index.html` in a web browser.

### 2. Supabase Integration (Optional)
To connect to Supabase database:

1. Create a Supabase project at https://supabase.com
2. Create the following tables:

```sql
-- Today Tips Table
CREATE TABLE today_tips (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    match TEXT NOT NULL,
    league TEXT NOT NULL,
    time TEXT NOT NULL,
    prediction TEXT NOT NULL,
    odds TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'draw')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Weekly Tips Table
CREATE TABLE weekly_tips (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    match TEXT NOT NULL,
    league TEXT NOT NULL,
    time TEXT NOT NULL,
    prediction TEXT NOT NULL,
    odds TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'draw')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Monthly Tips Table
CREATE TABLE monthly_tips (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    match TEXT NOT NULL,
    league TEXT NOT NULL,
    time TEXT NOT NULL,
    prediction TEXT NOT NULL,
    odds TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'draw')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Train Tips Table
CREATE TABLE train_tips (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    match TEXT NOT NULL,
    league TEXT NOT NULL,
    time TEXT NOT NULL,
    prediction TEXT NOT NULL,
    odds TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'draw')),
    created_at TIMESTAMP DEFAULT NOW()
);
```

3. Update `script.js` with your Supabase credentials:
   - Replace `SUPABASE_URL` with your project URL
   - Replace `SUPABASE_ANON_KEY` with your anon key

4. Uncomment the Supabase initialization code in `script.js`

## Admin Access

- **Username**: Kastul
- **Password**: Kastul@10

### Secret Admin Access
To access the admin panel, type the secret key sequence: **"kastul"** (6 letters) while on any page. The admin login modal will appear automatically.

**Security Note**: The admin access is completely hidden from normal users. There are no visible buttons or clues that indicate admin functionality exists.

## Usage

1. **Homepage**: Click on any of the four grid items to navigate to specific tips
2. **Tips Pages**: View tips for each category
3. **Admin Panel**: 
   - Login with admin credentials
   - Add new tips using the form
   - Edit existing tips by clicking "Edit"
   - Delete tips by clicking "Delete"

## Responsive Design

The website automatically adapts to different screen sizes:
- **Desktop**: Full 2x2 grid layout
- **Tablet**: Responsive grid with adjusted spacing
- **Mobile**: Single column layout with optimized touch targets

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Customization

### Colors
The color scheme can be modified in `styles.css`:
- Primary Green: `#4a7c59`
- Dark Green: `#2c5530`
- Gold: `#ffd700`
- Background: `#f8f9fa`

### Content
- Tips content is managed through the admin panel
- Mock data can be modified in `script.js` under the `mockData` object

## Troubleshooting

1. **Admin login not working**: Check browser console for errors
2. **Tips not loading**: Verify JavaScript is enabled
3. **Styling issues**: Clear browser cache and reload
4. **Mobile display problems**: Check viewport meta tag

## Future Enhancements

- Real-time data updates
- User registration system
- Email notifications
- Advanced filtering and search
- Analytics dashboard
- Mobile app integration
