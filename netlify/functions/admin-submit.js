const path = require('path');
const { Octokit } = require('@octokit/rest');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, message: 'Method not allowed' })
    };
  }

  if (!context.clientContext?.user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ ok: false, message: 'Member authentication is required.' })
    };
  }

  const formData = new URLSearchParams(event.body || '');
  const type = formData.get('type');
  const title = formData.get('title') || 'Untitled';
  const author = formData.get('author') || 'Club Member';
  const date = formData.get('date') || new Date().toISOString();
  const excerpt = formData.get('excerpt') || '';
  const content = formData.get('content') || '';
  const location = formData.get('location') || '';
  const description = formData.get('description') || '';
  const link = formData.get('link') || '';

  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!repo || !token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: 'GitHub environment variables are not configured.' })
    };
  }

  const [owner, repoName] = repo.split('/');
  const octokit = new Octokit({ auth: token });

  try {
    const contentFilePath = 'data/content.json';
    let siteContent = { blogPosts: [], events: [], gallery: [] };
    let contentFileSha;

    try {
      const existingFile = await octokit.repos.getContent({ owner, repo: repoName, path: contentFilePath, ref: branch });
      if (!Array.isArray(existingFile.data)) {
        siteContent = JSON.parse(Buffer.from(existingFile.data.content, 'base64').toString('utf8'));
        contentFileSha = existingFile.data.sha;
      }
    } catch (error) {
      // File does not exist yet; start with defaults.
    }

    let imageUrl = '/images/placeholder.webp';
    let uploadedImagePath = null;

    const imagePayload = formData.get('image');
    if (imagePayload) {
      try {
        const parsedImage = JSON.parse(imagePayload);
        if (parsedImage && parsedImage.base64) {
          const imageExtension = parsedImage.name?.split('.').pop() || 'webp';
          const imageFileName = `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.${imageExtension}`;
          const folder = type === 'blog' ? 'images/blog' : type === 'event' ? 'images/events' : 'images/gallery';
          uploadedImagePath = path.posix.join(folder, imageFileName);

          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo: repoName,
            path: uploadedImagePath,
            message: `Upload image for ${title}`,
            content: parsedImage.base64,
            branch
          });

          imageUrl = `/${uploadedImagePath}`;
        }
      } catch (error) {
        // Ignore invalid image payloads.
      }
    }

    if (type === 'blog') {
      const slug = `${new Date(date).toISOString().slice(0, 10)}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
      siteContent.blogPosts.push({
        slug,
        title,
        author,
        date,
        image: imageUrl,
        excerpt: excerpt || content,
        content: content || excerpt
      });
    }

    if (type === 'event') {
      const slug = `event-${new Date(date).toISOString().slice(0, 10)}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
      siteContent.events.push({
        slug,
        title,
        date,
        location,
        image: imageUrl,
        description: description || excerpt,
        content: description || excerpt,
        link
      });
    }

    if (type === 'photo') {
      const slug = `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
      siteContent.gallery.push({
        slug,
        src: imageUrl,
        alt: title
      });
    }

    const contentUpdate = {
      owner,
      repo: repoName,
      path: contentFilePath,
      message: `Add ${type} content: ${title}`,
      content: Buffer.from(JSON.stringify(siteContent, null, 2)).toString('base64'),
      branch
    };

    if (contentFileSha) {
      contentUpdate.sha = contentFileSha;
    }

    await octokit.repos.createOrUpdateFileContents(contentUpdate);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: error.message })
    };
  }
};
