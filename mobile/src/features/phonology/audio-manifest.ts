import { SOUND_LESSONS } from './content';

/**
 * An asset cannot be marked approved until ALL provenance and licensing fields
 * are present. Zero audio files ship with this feature; do not synthesize or
 * imply native-speaker verification on the fly.
 */
export type AudioAsset =
  | {
      status: 'unavailable';
      target: string;
      source: null;
      license: null;
      speakerOrSynthesis: null;
      pronunciationReviewedBy: null;
      attribution: null;
      uri: null;
    }
  | {
      status: 'approved';
      target: string;
      source: string;
      license: string;
      speakerOrSynthesis: string;
      pronunciationReviewedBy: string;
      attribution: string;
      uri: string;
    };

const targets = Array.from(new Set(
  SOUND_LESSONS.flatMap((lesson) => lesson.examples.map((example) => example.spelling)),
));

export const AUDIO_MANIFEST: readonly AudioAsset[] = targets.map((target) => ({
  status: 'unavailable' as const,
  target,
  source: null,
  license: null,
  speakerOrSynthesis: null,
  pronunciationReviewedBy: null,
  attribution: null,
  uri: null,
}));

export function audioForTarget(target: string): AudioAsset {
  return AUDIO_MANIFEST.find((item) => item.target === target) ?? {
    status: 'unavailable',
    target,
    source: null,
    license: null,
    speakerOrSynthesis: null,
    pronunciationReviewedBy: null,
    attribution: null,
    uri: null,
  };
}

export function isApprovedAudio(asset: AudioAsset): boolean {
  return asset.status === 'approved' &&
    Boolean(asset.uri && asset.source && asset.license &&
      asset.speakerOrSynthesis && asset.pronunciationReviewedBy);
}
