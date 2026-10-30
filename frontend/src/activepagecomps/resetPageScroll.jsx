import "../activepage.css";

function ResetPageScroll() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    document.querySelectorAll(
        "main, .main_content, .content_area, .dashboard_content, .page_content"
    ).forEach(element => {
        element.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
}

export default ResetPageScroll;