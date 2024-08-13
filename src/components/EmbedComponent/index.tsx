export {};
{
  /* <EmbedComponent></EmbedComponent> */
}
{
  /* <WebBrowserView
          url={`${
            config.API_URL
          }/web-browser?url=${encodeURIComponent(url)}`}
        ></WebBrowserView> */
}
{
  /* <iframe
          src={url}
          style={{ flex: 1, border: "none" }}
          title="Web Browser"
          height={"100%"}
          width={"100%"}
        /> */
}

// const EmbedComponent = () => {
//   const [url, setUrl] = useState("");
//   const [embedHtml, setEmbedHtml] = useState("");

//   let embedAPIEndpoint = `${config.API_URL}/embed`;

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(embedAPIEndpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           url,
//           maxwidth: 800,
//           autoplay: true,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const data = await response.json();
//       setEmbedHtml(data.html);
//     } catch (error) {
//       console.error("Error fetching embed:", error);
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={url}
//           onChange={(e) => setUrl(e.target.value)}
//           placeholder="Enter URL"
//           required
//         />
//         <button type="submit">Embed</button>
//       </form>
//       {embedHtml && <div dangerouslySetInnerHTML={{ __html: embedHtml }} />}
//     </div>
//   );
// };
