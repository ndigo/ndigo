# nd-aspect-ratio

> Fixed-ratio media frame that reserves space before the image loads.

## Usage

```html
<div class="nd-aspect">
    <img src="/cover.jpg" alt="Team photo" />
</div>

<div class="nd-aspect" style="--nd-aspect-ratio: 1">
    <video src="/clip.mp4" controls></video>
</div>
```

The default ratio is `16 / 9`; set `--nd-aspect-ratio` to any CSS ratio
(`1`, `4 / 3`, `21 / 9`). Images, videos, and iframes fill the frame with
`object-fit: cover`. Non-media children are centered, which makes the frame a
usable placeholder.

## Accessibility

The frame reserves the intrinsic space, so content does not shift when the media
arrives. Give media meaningful `alt` text (or an empty `alt` when decorative).
For iframes, keep a descriptive `title`.

## Styling

Import `nd-aspect-ratio.css` after the tokens. The frame uses the raised surface
as a placeholder background and a medium radius.
