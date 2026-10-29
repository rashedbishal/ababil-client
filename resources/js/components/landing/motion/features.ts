import { domMax } from 'motion/react';

// Loaded on demand by `LazyMotion` (see concept-3.tsx) so the animation
// engine (~30kb) ships as its own chunk instead of blocking the storefront's
// initial JS parse/execution - domMax (not domAnimation) because the nav's
// active-link pill uses `layoutId`, which only domMax supports.
export default domMax;
