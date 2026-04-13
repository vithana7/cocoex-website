# GSAP Scroll Patterns

Comprehensive guide to scroll-driven animations using GSAP 3.x and ScrollTrigger.

## Core Concepts

### ScrollTrigger Fundamentals

**Basic Pattern:**
```javascript
gsap.to(element, {
  // properties to animate
  scrollTrigger: {
    trigger: element,
    start: 'top center',
    end: 'bottom center',
    scrub: true,
    markers: false // true for debugging
  }
});
```

**Scrub Values:**
- `scrub: true` - Smooth 60fps interpolation (recommended)
- `scrub: 1` - 1 second lag (smoother but delayed)
- `scrub: false` - Instant snap (no smoothing)

### Centralized Timing Constants

**Pattern:**
```javascript
const SCROLL_TIMING = {
  SECTION_INTRO: 400,      // vh
  SECTION_TEXT: 350,       // vh
  CROSSFADE_DURATION: 80,  // vh
  PHASE_DURATION: 70,      // vh
};

// Use in ScrollTrigger
ScrollTrigger.create({
  start: `top+=${SCROLL_TIMING.SECTION_INTRO}vh top`,
  end: `top+=${SCROLL_TIMING.SECTION_INTRO + SCROLL_TIMING.SECTION_TEXT}vh top`,
});
```

**Benefits:**
- Single source of truth
- Easy global adjustments
- No cascading changes
- Self-documenting code

## Common Patterns

### 1. Fade-In on Scroll

```javascript
gsap.fromTo(element,
  { opacity: 0 },
  {
    opacity: 1,
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      end: 'top 40%',
      scrub: true,
      invalidateOnRefresh: true
    }
  }
);
```

### 2. Crossfade Transition

```javascript
const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: wrapper,
    start: `top+=${startVh}vh top`,
    end: `top+=${endVh}vh top`,
    scrub: true,
    invalidateOnRefresh: true
  }
});

timeline
  .fromTo(oldElement,
    { opacity: 1 },
    { opacity: 0, ease: 'none' },
    0
  )
  .fromTo(newElement,
    { opacity: 0 },
    { opacity: 1, ease: 'none' },
    0
  );
```

### 3. Sequential Timeline

```javascript
const timeline = gsap.timeline({
  defaults: { ease: 'power3.out' }
});

timeline
  .from(element1, { y: 50, opacity: 0, duration: 0.5 })
  .from(element2, { y: 50, opacity: 0, duration: 0.5 }, '-=0.3') // overlap
  .from(element3, { y: 50, opacity: 0, duration: 0.5 }, '-=0.3');
```

### 4. Scroll-Driven State Updates

```javascript
const state = { progress: 0 };

gsap.to(state, {
  progress: 1,
  ease: 'none',
  scrollTrigger: {
    trigger: element,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      updateCustomAnimation(state.progress);
    }
  }
});
```

### 5. Sticky Section with Reveal

```javascript
// HTML: <div class="wrapper"><div class="sticky-content">...</div></div>

gsap.fromTo('.sticky-content',
  { opacity: 0 },
  {
    opacity: 1,
    scrollTrigger: {
      trigger: '.wrapper',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      pin: true, // pins the element
      anticipatePin: 1 // smooth pinning
    }
  }
);
```

## Advanced Techniques

### Variable Duration Highlights

```javascript
const DURATIONS = [0.8, 1.0, 0.8]; // vh per word
const totalDuration = DURATIONS.reduce((sum, d) => sum + d, 0);

const timeline = gsap.timeline({
  scrollTrigger: {
    start: `top+=${startVh}vh top`,
    end: `top+=${startVh + totalDuration * viewportHeight}px top`,
    scrub: true
  }
});

let cumulativeProgress = 0;
words.forEach((word, i) => {
  const normalizedDuration = DURATIONS[i] / totalDuration;

  timeline
    .to(word, {
      onStart: () => word.classList.add('active'),
      duration: 0.01
    }, cumulativeProgress)
    .to({}, { duration: normalizedDuration - 0.02 }, cumulativeProgress + 0.01)
    .to(word, {
      onComplete: () => word.classList.remove('active'),
      duration: 0.01
    }, cumulativeProgress + normalizedDuration - 0.01);

  cumulativeProgress += normalizedDuration;
});
```

### Conditional ScrollTrigger

```javascript
ScrollTrigger.create({
  trigger: element,
  start: 'top bottom',
  onEnter: () => {
    if (!hasBeenActivated) {
      activateFeature();
    }
  },
  onLeaveBack: () => {
    if (shouldDeactivateOnReverse) {
      deactivateFeature();
    }
  }
});
```

### Responsive ScrollTrigger

```javascript
ScrollTrigger.matchMedia({
  // Desktop
  '(min-width: 1024px)': function() {
    gsap.to(element, {
      x: 500,
      scrollTrigger: { ... }
    });
  },

  // Mobile
  '(max-width: 1023px)': function() {
    gsap.to(element, {
      x: 200,
      scrollTrigger: { ... }
    });
  }
});
```

## Performance Optimization

### Best Practices

1. **Use `scrub: true`** - Smoothest performance, GSAP handles interpolation
2. **Hardware-accelerated properties only** - `transform`, `opacity`, `filter`
3. **Avoid layout triggers** - Don't animate `width`, `height`, `top`, `left`
4. **Debounce resize** - Refresh ScrollTrigger after resize completes
5. **Use `invalidateOnRefresh: true`** - Recalculates on window resize
6. **Use `anticipatePin: 1`** - Smoother pinning behavior

### Optimization Checklist

```javascript
// ✅ Good
gsap.to(element, {
  x: 100,
  opacity: 0.5,
  scale: 1.2,
  rotation: 45
});

// ❌ Bad (triggers layout)
gsap.to(element, {
  width: '100%',
  height: '500px',
  top: '50px',
  marginLeft: '20px'
});
```

### Debounced Refresh

```javascript
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const handleResize = debounce(() => {
  ScrollTrigger.refresh();
}, 150);

window.addEventListener('resize', handleResize, { passive: true });
```

## Mobile Considerations

### Touch-Friendly Scrolling

```javascript
// Avoid scroll-jacking
scrollTrigger: {
  scrub: true, // not scrub: 2 (too slow on mobile)
  anticipatePin: 1, // smooth on touch devices
  invalidateOnRefresh: true
}
```

### Reduce Complexity on Mobile

```javascript
const isMobile = window.innerWidth <= 768;

gsap.to(element, {
  // Simpler animation on mobile
  opacity: isMobile ? 1 : 0.5,
  scale: isMobile ? 1 : 1.2,
  scrollTrigger: { ... }
});
```

### Disable Heavy Effects

```javascript
if (window.innerWidth > 768) {
  // Desktop-only heavy animation
  gsap.to(particleContainer, {
    opacity: 1,
    scrollTrigger: { ... }
  });
}
```

## Debugging

### Enable Markers

```javascript
scrollTrigger: {
  markers: true, // Shows start/end markers
  id: 'my-animation' // Label for easier identification
}
```

### Log Progress

```javascript
scrollTrigger: {
  onUpdate: (self) => {
    console.log('Progress:', self.progress);
    console.log('Scroll:', self.scroll());
  }
}
```

### Common Issues

**Animation not triggering:**
- Check `start`/`end` values
- Enable `markers: true`
- Verify element exists in DOM
- Check for CSS `display: none` on trigger

**Janky scrolling:**
- Use `scrub: true` instead of boolean
- Avoid animating layout properties
- Check for other scroll listeners
- Profile with Chrome DevTools

**Not refreshing on resize:**
- Add `invalidateOnRefresh: true`
- Call `ScrollTrigger.refresh()` manually
- Check debounce timing

## Examples from cocoex.xyz

### Word Highlight Timeline

```javascript
// From main.js:830-873
const highlightTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '.scroll-container',
    start: () => `top+=${textSectionTop + h * 0.5}px top`,
    end: () => `top+=${textSectionTop + h * 0.5 + h * totalDuration}px top`,
    scrub: true,
    invalidateOnRefresh: true,
    anticipatePin: 1
  }
});

// Variable duration per word
elements.highlightWords.forEach((word, index) => {
  const duration = SCROLL_TIMING.WORD_HIGHLIGHT_DURATIONS[index];
  const normalizedDuration = duration / totalDuration;

  highlightTimeline
    .to(word, {
      onStart: () => word.classList.add('highlight-active'),
      duration: 0.01
    }, cumulativeProgress)
    .to({}, { duration: normalizedDuration - 0.02 }, cumulativeProgress + 0.01)
    .to(word, {
      onComplete: () => word.classList.remove('highlight-active'),
      duration: 0.01
    }, cumulativeProgress + normalizedDuration - 0.01);

  cumulativeProgress += normalizedDuration;
});
```

### Crossfade with Multiple Elements

```javascript
// From main.js:943-976
gsap.timeline({
  scrollTrigger: {
    trigger: '.muse-section-wrapper',
    start: `top+=${museCrossfadeStart}vh top`,
    end: `top+=${museCrossfadeEnd}vh top`,
    scrub: true,
    invalidateOnRefresh: true,
    anticipatePin: 1
  }
})
.fromTo([museIntroLogo, museIntroText],
  { opacity: 1 },
  { opacity: 0, ease: 'none' },
  0
)
.fromTo(museIntroPage,
  { opacity: 1 },
  { opacity: 0, ease: 'none' },
  0
)
.fromTo(whiteContent,
  { opacity: 0 },
  { opacity: 1, ease: 'none' },
  0
)
.fromTo(museCenterLogo,
  { opacity: 0, scale: 0.95 },
  { opacity: 1, scale: 1, ease: 'none' },
  0
);
```

## Resources

- [GSAP ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [GSAP Easing Visualizer](https://greensock.com/ease-visualizer)
- [ScrollTrigger Demos](https://codepen.io/collection/AEbkkJ)
- [Performance Best Practices](https://greensock.com/performance/)
