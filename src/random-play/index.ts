// Random Play — public surface. Import styles once: import "random-play/styles.css".
export { FLOW_BELOW, RandomPlayProvider, STAGE_W, useAssets } from "./context";
export { createAssets, type Assets, type UiAsset } from "./assets";
export * from "./tokens";

export type * from "./data/types";
export { SECTIONS } from "./data/types";
export { deriveAssault, deriveRoster, deriveShiyu, deriveTeams, flattenRuns, type CoachAssault, type CoachRoster, type CoachSetlists, type CoachShiyu } from "./data/derive";
export { BANGBOO_NAME, DA_CAP, HAS_EMOTE, ICON_ID, SHIYU_RATING_TARGETS, SHIYU_ROOM_CAP, SHIYU_SPLUS_TOTAL, SPINE_NAME } from "./data/meta";

export { RandomPlay, type RandomPlayProps, type RandomPlayState, type View } from "./components/RandomPlay";
export { StoreHeader, TrackingBand, type SectionId } from "./components/StoreHeader";
export { Clerk, GenreFilterBar, Tape, TapeWall, Ticker, type GenreFilter } from "./components/TapeWall";
export { SwitcherStrip } from "./components/SwitcherStrip";
export { JacketCover, TapeJacket, type JacketTab } from "./components/TapeJacket";
export { ChaptersPanel, ScenesPanel, SpecsPanel } from "./components/panels";
export { BangbooBadge, FeatureStage, SquadCard, TeamRail, TripleFeatures } from "./components/TripleFeatures";
export { Chip, Eyebrow, GradeSticker, Halftone } from "./components/primitives";
export { CastCircles, ElementChips, HistoryStrip } from "./components/endgame";
export { Receipt, Register, RoomSlip } from "./components/Register";
export { Letterboard, NowShowing, Poster } from "./components/NowShowing";
export { ChannelSearch, Deck } from "./components/ChannelSearch";
export { ShelfTalker, StaffPicks } from "./components/StaffPicks";
export { derivePicks, deriveSignal, pullArt, signalLedger, type CoachPicks, type CoachSignal } from "./data/store";
