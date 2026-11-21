# Art layers needed (PNG with alpha, canvas 1080x1920, put in `public/`)

| path | content | notes |
|---|---|---|
| s1/wall.png | yellow wall + diagonal sun shadow + floor tiles | opaque; ink `#3a3233`, wall `#f8dd61`, shadow `#bc9b09`, floor `#a99b81` |
| s1/woman.png, s1/child.png | victims sitting | crying face as a swappable layer: `*_face_a/b.png` |
| s1/bowl.png | teal bowl `#478f7e` | squash version for the landing |
| s1/legs_a.png, legs_b.png | passer-by legs + bag, cropped at the hips | no faces |
| insert/bowl_floor.png | extreme close-up bowl on tiles, darker `#be9b05` wall | |
| eyes/eyes.png | wide strip of the god's eyes, closed + open glow version | cyan `#90ecef` glow |
| hero/clouds.png | teal storm clouds, taller than the canvas (scrolls up) | `#0e3f43`, `#367d86` |
| hero/body.png, arm.png, halo.png | floating figure without arms + one arm sprite + yellow mandala | dhoti gold `#c8b21b`, sash `#7f0d28` |
| s6/street_blur.png | pale sky + soft blurred street (blur baked in) | `#f4f6ec`, teal band |
| s6/man_body.png, man_face_grin.png, man_face_broken.png | villain body + two faces | broken = bloodshot, fangs, stylised |
| s6/god_back.png, god_arm_choke.png | god from behind + extended arm | skin `#56aeea` |

Style prompt block for an image model: "flat cel-shaded 2D illustration, thin dark linework, two-tone hard-edged shadows, saturated yellow/teal palette, vertical 9:16, plain background (for cut-out)". Generate each character at one consistent seed/reference, then cut out.
