// save the style to local storage
document.getElementById('apply').addEventListener('click', () => {
  const style = document.getElementById('style').value;
  chrome.storage.sync.set({ style }, () => {
    console.log('Style is set to ' + style);
  });
});
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('style', ({ style }) => {
    document.getElementById('style').value = style;
  });
});

// get styles from server
const errorDiv = document.getElementById('error');
(async () => {
  const styleSelector = document.getElementById('style');

  let response = await fetch('http://therack.ddns.net:30000/styles');
  if (response.status === 200) {
    /**
     * @type {import('../../server/src/index').GetStylesResponse}
     */
    let res = await response.json();
    console.log('response', res);
    res.styles.forEach((style) => {
      const option = document.createElement('option');
      option.value = style.styleName;
      option.innerHTML = style.styleName;
      styleSelector.appendChild(option);
    });
  } else {
    errorDiv.innerHTML = 'Error getting styles from server ' + response.status;
  }
})();
