# Rohit Durbha Software Portfolio

This is my software engineering portfolio, drawn as an isometric map of San Francisco that visitors can roam freely. The street grid, coastline, parks and landmarks are laid out from real coordinates. It is a plain static site with no build step, so GitHub Pages can serve the files exactly as they are.

## Files

| File | What it holds |
| --- | --- |
| `content.js` | Every word, number, link and map stop shown on the site |
| `resume.pdf` | The resume that the two resume links open |
| `index.html` | The page shell and all of the styling |
| `app.js` | The code that builds the city, draws the map and handles roaming |
| `fonts/` | Geist Serif and Geist Pixel, both under the SIL Open Font License |
| `tiles/` | The illustrated strip that runs from Chinatown down through the Mission |

## Editing the content

1. Open `content.js` on GitHub and press the pencil icon to edit it.
2. Change the text between the quotation marks and leave the field names alone.
3. Press the green commit button, and the live site refreshes about a minute later.

Each block inside `stops` is one place on the map. To add a project, copy a block, paste it where it belongs in the walk and change its fields. Set `at` to the latitude and longitude of the place, and set `scene` to `tower` so a building rises at that spot. The stop numbers, the route line and the side rail all update on their own.

The scene and color names you can use are listed in the comment that opens `content.js`.

## Replacing the resume

1. Rename the new resume on your computer to `resume.pdf`.
2. On the repository page choose Add file, then Upload files, and drop the PDF in.
3. Commit the upload, and GitHub replaces the old file because the names match.

## Previewing on your own computer

Run the command below inside this folder and open the address that it prints.

```bash
python3 -m http.server 8000
```

## Credits

The illustrated strip in `tiles/` is isometric artwork © Justin Chavez from [isometricsf.com](https://isometricsf.com), downsampled and reused under his CC BY-NC 4.0 terms, which ask for credit and a link. The rest of the city is drawn in code from real coordinates.
