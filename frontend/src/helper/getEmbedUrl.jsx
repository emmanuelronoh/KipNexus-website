// just parses and valiades youtube link
export default function getEmbedUrl(youtubeUrl) {
  let regex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;
  let isValidYoutubeUrl = regex.test(youtubeUrl);

  if (!isValidYoutubeUrl) {
    return null;
  } else if (youtubeUrl.includes('embed')) {
    return youtubeUrl;
  }
  try {
    let url = new URL(youtubeUrl);
    let videoId = url.searchParams.get('v');
    let embedUrl = 'https://www.youtube.com/embed/' + videoId;
    return embedUrl;
  } catch (error) {
    console.error('An error occured', error);
  }
}
