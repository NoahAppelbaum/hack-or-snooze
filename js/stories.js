"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup");

  //set initial star icon state
  let starStyle;
  if (currentUser) {
    starStyle = currentUser.hasFavorite(story) ? "bi-star-fill" : "bi-star";
  } else {
    starStyle = "hidden";
  }

  const hostName = story.getHostName();
  return $(`
  <li id="${story.storyId}">
  <i class="bi favorite-star ${starStyle}"></i>
  <a href="${story.url}" target="a_blank" class="story-link">
  ${story.title}
  </a>
  <small class="story-hostname">(${hostName})</small>
  <small class="story-author">by ${story.author}</small>
  <small class="story-user">posted by ${story.username}</small>
  </li>
  `);
}


/** Adds  a new story or removes an already-favorited story
 * from the current user's favorites list  */

async function handleFavoriteStarClick(evt) {
  const $star = $(evt.target);
  const storyId = $star.parent().attr("id");
  const story = await Story.getStoryById(storyId);
  if (currentUser.hasFavorite(story)) {
    await currentUser.removeFavorite(story);
    $star.toggleClass("bi-star bi-star-fill");
  } else {
    await currentUser.addFavorite(story);
    $star.toggleClass("bi-star bi-star-fill");
  }
}

$allStoriesList.on("click", ".favorite-star", handleFavoriteStarClick);

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


/** Creates new story on submit form submission */
async function submitNewStory(evt) {
  evt.preventDefault();
  console.debug("submitNewStory");

  const author = $("#story-author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();

  const createdStory = await storyList.addStory(currentUser, { author, title, url });
  prependStory(createdStory);
  $storyForm.trigger("reset");
}

$("#story-form").on("submit", submitNewStory);

/** Adds story to top of feed. */
function prependStory(story) {
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  hidePageComponents();
  $allStoriesList.show();
}


/** Displays current user's favorited stories on page */
function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $allStoriesList.empty();

  // loop through all of favorites and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
