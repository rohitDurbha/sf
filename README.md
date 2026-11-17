# Rohit Durbha Software Portfolio

This is my software engineering portfolio, set on an isometric map of San Francisco that visitors can roam freely. My projects sit as pins at real places across the city. It is a plain static site with no build step, so GitHub Pages can serve the files exactly as they are.

## Files

| File | What it holds |
| --- | --- |
| `content.js` | Every word, number, link and map stop shown on the site |
| `resume.pdf` | The resume that the two resume links open |
| `index.html` | The page shell and all of the styling |
| `app.js` | The code that loads the map, places the stops and handles roaming |
| `fonts/` | Geist Serif and Geist Pixel, both under the SIL Open Font License |

## Editing the content

1. Open `content.js` on GitHub and press the pencil icon to edit it.
2. Change the text between the quotation marks and leave the field names alone.
3. Press the green commit button, and the live site refreshes about a minute later.

Each block inside `stops` is one place on the map. To add a project, copy a block, paste it where it belongs in the walk and change its fields. Set `at` to the latitude and longitude of the place, and set `scene` to `tower` for a plain pin. The stop numbers, the route line and the side rail all update on their own.

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

The map artwork is © Justin Chavez and is loaded live from [isometricsf.com](https://isometricsf.com). He licenses the tiles under CC BY-NC 4.0, which allows non-commercial reuse with credit and a link, so the credit line at the bottom of the page needs to stay. The map data behind his artwork is © OpenStreetMap contributors, and the imagery was captured from Google Maps Photorealistic 3D Tiles.
