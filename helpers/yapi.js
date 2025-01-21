const YA_300_API = 'https://300.ya.ru/api/sharing-url';

exports.request = (token, article_url) => {
  return fetch(YA_300_API, {
    method: 'POST',
    headers: {
      'Authorization': `OAuth ${token}`,
      'Content-Type': 'application/json'
    },
    body:
      JSON.stringify({
        'article_url': article_url
      })
  })
    .then((res) => {
      if (res.ok) return res.json();
      return Promise.reject(res.status);
    });
};