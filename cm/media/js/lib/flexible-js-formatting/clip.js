if (window.clipboardData) {
    c = window.clipboardData.getData("Text");
    if (c) {
        document.write("<p>The contents of your clipboard:</p>");
        document.write("<blockquote>" + c + "</blockquote>");
    }
}
