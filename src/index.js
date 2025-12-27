export default {
  async fetch(request) {
    return new Response("Hello World", {
      headers: {
        "content-type": "text/plain",
      },
    });
  },
};

