const contentTypeButtons = document.querySelectorAll('.admin-type-button');
const forms = {
  blog: document.getElementById('blog-form'),
  event: document.getElementById('event-form'),
  photo: document.getElementById('photo-form')
};
const statusBox = document.getElementById('admin-status');

function setActiveType(type) {
  contentTypeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.type === type);
    const form = forms[button.dataset.type];
    if (form) {
      form.style.display = button.dataset.type === type ? 'block' : 'none';
    }
  });
}

contentTypeButtons.forEach((button) => {
  button.addEventListener('click', () => setActiveType(button.dataset.type));
});

function showStatus(message) {
  statusBox.textContent = message;
  statusBox.classList.add('show');
}

function resetForm(form) {
  if (!form) return;
  form.reset();
}

function convertImageToWebp(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Unable to convert image.'));
              return;
            }
            const reader2 = new FileReader();
            reader2.onload = function (readerEvent) {
              resolve({
                name: `${file.name.replace(/\.[^.]+$/, '')}.webp`,
                base64: readerEvent.target.result.split(',')[1]
              });
            };
            reader2.readAsDataURL(blob);
          },
          'image/webp',
          0.85
        );
      };
      img.onerror = () => reject(new Error('The selected file is not a valid image.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('The file could not be read.'));
    reader.readAsDataURL(file);
  });
}

async function handleSubmission(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const type = form.dataset.type;
  const params = new URLSearchParams();
  params.set('type', type);

  Array.from(form.elements).forEach((element) => {
    if (!element.name || element.disabled) return;
    if (element.type === 'file') {
      return;
    }
    if (element.type === 'submit') {
      return;
    }
    params.set(element.name, element.value);
  });

  try {
    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput && fileInput.files[0]) {
      const convertedFile = await convertImageToWebp(fileInput.files[0]);
      params.set('image', JSON.stringify(convertedFile));
    }

    const response = await fetch('/.netlify/functions/admin-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: params.toString()
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok || !responseData.ok) {
      throw new Error(responseData.message || 'Submission failed.');
    }

    showStatus('Content saved successfully.');
    resetForm(form);
  } catch (error) {
    console.error(error);
    showStatus(error.message || 'There was a problem saving your content.');
  }
}

document.querySelectorAll('.admin-form').forEach((form) => {
  form.addEventListener('submit', handleSubmission);
});

setActiveType('blog');
