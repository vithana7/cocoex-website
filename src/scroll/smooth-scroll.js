import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Lenis virtualizes scroll and rides GSAP's ticker (NOT its own RAF). Body is the
// scroll container — the layout makes <body> scroll (overflow-y:auto; height:100%),
// so Lenis must wrap body explicitly and ScrollTrigger gets a scrollerProxy over it.
//
// normalizeScroll is intentionally NOT enabled: Lenis already does its job, and the
// two together deadlock iOS Safari. Do not re-enable it.

export function initSmoothScroll() {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    wrapper: document.body,
    content: document.querySelector('.scroll-container'),
    lerp: 0.1,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.0,
    autoRaf: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
  });

  ScrollTrigger.defaults({ scroller: document.body });

  window.lenis = lenis;
  return lenis;
}
