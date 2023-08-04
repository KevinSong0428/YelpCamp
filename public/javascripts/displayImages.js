function previewMultiple(event) {
    // clear preview of images if any were previously selected
    const form = document.querySelector("#formFile");
    form.innerHTML = "";

    const images = document.getElementById("image");
    const number = images.files.length;
    for (i = 0; i < number; i++) {
        const urls = URL.createObjectURL(event.target.files[i]);
        const fileName = event.target.files[i].name;
        // add preview and file name as a caption
        document.getElementById("formFile").innerHTML += `<figure class="figure"> <img src="${urls}"> <figcaption class = "figure-caption">${fileName}</figcaption></figure>`;
    }
}