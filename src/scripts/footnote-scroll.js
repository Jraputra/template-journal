document.addEventListener('click', (e) => {
  // Find the actual clicked element that might be a link
  const clickedLink = e.target.closest('a');
  if (!clickedLink) return;

  // Get the href and check if it's a footnote link
  const href = clickedLink.getAttribute('href');
  if (!href) return;

  // Check if it's a footnote reference or back-reference
  if (href.match(/^#user-content-fn-\d+/) || href.match(/^#user-content-fnref-\d+/)) {
    e.preventDefault();
    
    // Find the target element
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Smooth scroll to the target
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Update URL without refreshing
      history.pushState(null, '', href);
      
      // Add highlight effect
      targetElement.classList.add('footnote-highlight');
      setTimeout(() => {
        targetElement.classList.remove('footnote-highlight');
      }, 2000);
    }
  }
});
