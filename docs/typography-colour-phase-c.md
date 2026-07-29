# Typography Colour Phase C

## Colour-source map

- Publication typography authority: `src/types.ts` (`BookTypographySettings`) and
  `src/lib/bookTypography.ts`. Existing body, chapter-opening, continuation and
  divider colours remain the rendered style values.
- Palette authority: `BookProject.colourSettings`, resolved only through
  `src/lib/bookColours.ts`. Existing projects receive a Legacy-derived palette
  whose values are copied from their current typography.
- Manual override: `ContentBlock.textColour` applies to the complete block.
  Resolution order is explicit block colour, semantic block role, body colour,
  safe built-in fallback.
- Editor: `src/components/EditorCanvas.tsx`; Focus Mode:
  `src/components/FocusMode.tsx`; Print Preview:
  `src/components/PrintPreviewModal.tsx`.
- Print/PDF, HTML, EPUB and DOCX adapters are in `src/lib/exportUtils.ts`.
  Markdown remains semantic and does not receive colour markup.
- Cover colours (`CoverConfig` and `CoverEditor`), Design Studio
  `primaryColor`/`secondaryColor`, Company Profile brand colours, and cartoon,
  educational, chart and illustration colours are separate authorities and are
  intentionally untouched.
- Application warning/status colours and specialised callout, code, graph and
  illustration colours remain renderer-specific.

## Behaviour and limitations

Palette preview state lives inside the lazy Typography workspace until Apply.
Applying a palette updates supported typography style colours, sets the
typography preset to Custom, and never removes block overrides. The editor
supports only whole-block colour; partial-text colour requires a future
structured rich-text model.

Only opaque RGB hex colours are accepted. Alpha, gradients, CMYK, spot colours
and arbitrary CSS functions are unsupported. Screen contrast uses WCAG relative
luminance; printed output varies with printer, paper and ink. Publication page
background remains white. Some readers, word processors and browser print
settings may reproduce colour differently.
