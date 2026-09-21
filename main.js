const galleryGrid = document.getElementById("gallery-grid");
const galleryPageGrid = document.getElementById("gallery-page-grid");
const homepageEventsContainer = document.getElementById("homepage-events");
const homepageBlogList = document.getElementById("homepage-blog-list");
const blogPostList = document.getElementById("blog-post-list");
const eventPostList = document.getElementById("event-post-list");

const defaultBlogPosts = [
  {
    slug: "future-model-railroaders",
    title: "Inspiring future model railroaders",
    author: "TVMR Staff",
    date: "June 12, 2026",
    image: "/images/placeholder.webp",
    excerpt: "Model railroading is more than a hobby; it’s a gateway to creativity, engineering, and community.",
    content: "Our club continues to welcome young visitors and families who want to explore the hobby, learn how models are built, and discover how railroads tell stories about history and place."
  },
  {
    slug: "new-layout-additions",
    title: "New additions coming soon",
    author: "Club Reporter",
    date: "June 26, 2026",
    image: "/images/placeholder.webp",
    excerpt: "Our members are building new pieces and preparing fresh displays for visitors of all ages.",
    content: "Updates are underway across the layout as members finish scenic details, add new rolling stock, and prepare fresh displays for visitors throughout the season."
  },
  {
    slug: "community-showcase",
    title: "A look at our community showcase",
    author: "Layout Team",
    date: "July 4, 2026",
    image: "/images/placeholder.webp",
    excerpt: "The latest showcase brought together club members, neighbors, and families for an afternoon of model railroading fun.",
    content: "The community showcase highlighted the craftsmanship of our club while giving visitors a first look at new scenes and interactive displays."
  }
];

const defaultEvents = [
  {
    slug: "moonpie-festival",
    title: "31st Annual RC-MoonPie Festival",
    date: "Sat, Jun 20",
    location: "Bell Buckle City Center",
    image: "/images/placeholder.webp",
    description: "Join the community for an afternoon of local fun, food, and railroad-themed activities.",
    content: "The festival is a great way to meet neighbors, share model railroad stories, and celebrate the railroad heritage of Bell Buckle."
  },
  {
    slug: "movie-night",
    title: "Model Railroad Movie Night Extravaganza",
    date: "Tue, Jun 23",
    location: "TVMR Club",
    image: "/images/placeholder.webp",
    description: "Watch classic railroad films, share model stories, and meet other club members.",
    content: "Members will gather for a relaxed evening of films, conversation, and a closer look at some of the finest model railroad projects in the region."
  },
  {
    slug: "webb-craft-show",
    title: "Webb Craft Show",
    date: "Sat, Oct 17",
    location: "Bell Buckle City Center",
    image: "/images/placeholder.webp",
    description: "Visit our display during the Webb Craft Show and learn how to get involved with the club.",
    content: "The craft show is a great opportunity for new visitors to see the club’s work, ask questions, and sign up for future events."
  }
];

let blogPosts = [...defaultBlogPosts];
let events = [...defaultEvents];
let galleryItems = [];

async function loadSiteContent() {
  try {
    const response = await fetch(`/data/content.json?v=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error('Content file unavailable');
    }

    const data = await response.json();

    if (Array.isArray(data.blogPosts) && data.blogPosts.length) {
      blogPosts = data.blogPosts.sort((firstPost, secondPost) => {
        return new Date(secondPost.date) - new Date(firstPost.date);
      });
    }

    if (Array.isArray(data.events) && data.events.length) {
      events = data.events;
    }

    if (Array.isArray(data.gallery) && data.gallery.length) {
      galleryItems = data.gallery;
    }
  } catch (error) {
    console.warn('Using default content:', error);
  }
}

function renderGallery(container, limit = 10) {
  if (!container) {
    return;
  }

  const renderItems = (items) => {
    const itemsToRender = items.slice(0, limit);

    itemsToRender.forEach((itemData) => {
      const item = document.createElement("figure");
      item.className = "gallery-item";

      const link = document.createElement("a");
      link.href = itemData.src;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const img = document.createElement("img");
      img.src = itemData.src;
      img.alt = itemData.alt || "Club photo";
      link.appendChild(img);
      item.appendChild(link);

      container.appendChild(item);
    });
  };

  const loadGalleryData = async () => {
    try {
      const response = await fetch("/gallery.json");
      if (!response.ok) {
        throw new Error("Gallery manifest unavailable");
      }
      const manifestItems = await response.json();
      const combinedItems = [...manifestItems, ...galleryItems];
      renderItems(combinedItems);
    } catch (error) {
      console.error("Gallery manifest load failed:", error);
      renderItems(galleryItems);
    }
  };

  loadGalleryData();
}

function createBlogCard(post) {
  const article = document.createElement("article");
  article.className = "blog-card";

  article.innerHTML = `
    <div><img src="${post.image}" alt="${post.title}" class="blog-image"></div>
    <div class="blog-copy">
      <div class="blog-meta">
        <p class="blog-author">${post.author}</p>
        <p class="blog-date">${post.date}</p>
      </div>
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <a class="post-link" href="blog.html?post=${post.slug}">Read more</a>
    </div>
  `;

  return article;
}

function createEventCard(eventItem) {
  const article = document.createElement("article");
  article.className = "event-card";

  article.innerHTML = `
    <div><img src="${eventItem.image}" class="event-image" alt="${eventItem.title}"></div>
    <div class="event-copy">
      <p class="event-date">${eventItem.date} · ${eventItem.location}</p>
      <h3>${eventItem.title}</h3>
      <p>${eventItem.description}</p>
    </div>
  `;

  const link = document.createElement("a");
  link.className = "post-link";
  link.href = `events.html?post=${eventItem.slug}`;
  link.textContent = "View details";
  article.appendChild(link);

  return article;
}

function renderHomepageContent() {
  if (homepageEventsContainer) {
    events.slice(0, 3).forEach((eventItem) => homepageEventsContainer.appendChild(createEventCard(eventItem)));
  }

  if (homepageBlogList) {
    blogPosts.slice(0, 3).forEach((post) => homepageBlogList.appendChild(createBlogCard(post)));
  }
}

function renderBlogPage() {
  if (!blogPostList) {
    return;
  }

  const selectedPostSlug = new URLSearchParams(window.location.search).get("post");

  if (selectedPostSlug) {
    const selectedPost = blogPosts.find((post) => post.slug === selectedPostSlug);

    if (!selectedPost) {
      blogPostList.innerHTML = '<p>That post could not be found.</p>';
      return;
    }

    blogPostList.innerHTML = "";
    const detailCard = document.createElement("article");
    detailCard.className = "post-detail-card";
    detailCard.innerHTML = `
      <a class="page-back" href="blog.html">← Back to all posts</a>
      <img src="${selectedPost.image}" alt="${selectedPost.title}">
      <div class="detail-meta">
        <span>${selectedPost.author}</span>
        <span>${selectedPost.date}</span>
      </div>
      <h3>${selectedPost.title}</h3>
      <p>${selectedPost.content}</p>
    `;
    blogPostList.appendChild(detailCard);
    return;
  }

  blogPostList.innerHTML = "";
  blogPosts.forEach((post) => blogPostList.appendChild(createBlogCard(post)));
}

function renderEventPage() {
  if (!eventPostList) {
    return;
  }

  const selectedPostSlug = new URLSearchParams(window.location.search).get("post");

  if (selectedPostSlug) {
    const selectedEvent = events.find((eventItem) => eventItem.slug === selectedPostSlug);

    if (!selectedEvent) {
      eventPostList.innerHTML = '<p>That event could not be found.</p>';
      return;
    }

    eventPostList.innerHTML = "";
    const detailCard = document.createElement("article");
    detailCard.className = "post-detail-card";
    detailCard.innerHTML = `
      <a class="page-back" href="events.html">← Back to all events</a>
      <img src="${selectedEvent.image}" alt="${selectedEvent.title}">
      <div class="detail-meta">
        <span>${selectedEvent.date}</span>
        <span>${selectedEvent.location}</span>
      </div>
      <h3>${selectedEvent.title}</h3>
      <p>${selectedEvent.content}</p>
    `;
    eventPostList.appendChild(detailCard);
    return;
  }

  eventPostList.innerHTML = "";
  events.forEach((eventItem) => eventPostList.appendChild(createEventCard(eventItem)));
}

const memorialCarousel = document.getElementById("memorial-carousel");
const memorialPrevButton = document.querySelector(".carousel-prev");
const memorialNextButton = document.querySelector(".carousel-next");

if (memorialCarousel && memorialPrevButton && memorialNextButton) {
  const updateCarouselButtons = () => {
    const maxScrollLeft = memorialCarousel.scrollWidth - memorialCarousel.clientWidth;
    memorialPrevButton.disabled = memorialCarousel.scrollLeft <= 0;
    memorialNextButton.disabled = memorialCarousel.scrollLeft >= maxScrollLeft - 2;
  };

  memorialPrevButton.addEventListener("click", () => {
    memorialCarousel.scrollBy({ left: -320, behavior: "smooth" });
  });

  memorialNextButton.addEventListener("click", () => {
    memorialCarousel.scrollBy({ left: 320, behavior: "smooth" });
  });

  memorialCarousel.addEventListener("scroll", updateCarouselButtons, { passive: true });
  window.addEventListener("resize", updateCarouselButtons);
  updateCarouselButtons();
}

// Contact form handling
const contactForm = document.getElementById("contact-form");
const successMessage = document.getElementById("success-message");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (response.ok) {
        contactForm.style.display = "none";
        successMessage.style.display = "block";
        successMessage.scrollIntoView({ behavior: "smooth" });
      } else {
        alert("There was an error sending your message. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("There was an error sending your message. Please try again.");
    }
  });
}

async function initializeSite() {
  await loadSiteContent();
  renderHomepageContent();
  renderBlogPage();
  renderEventPage();
  renderGallery(galleryGrid, 10);
  renderGallery(galleryPageGrid, 20);
}

initializeSite();