$(document).ready(function() {
    // Events

    // Icon menu DOM-path
    var menu = "header #inner #menu";
    // Add an event-listener to all the icon-buttons
    $(document).on("click", "#btn-content,#btn-members,#btn-bank,#btn-information,#btn-admin", menu,
        function() {
            // Hide all submenus
            $(".submenu", menu).hide();

            // Get the id of the sub menu (will always be id of strip button minus "btn-")
            var id = $(this).attr("id").split("-")[1];

            // Show the relevant submenu
            $("#" + id, menu).show();
        }
    );
    // Close submenu at click anywhere else
    $(document).mouseup(function(e) {
        // Get submenu
        var container = $(".submenu", menu);
        if (!container.is(e.target) && container.has(e.target).length === 0)
            container.hide();
    });
});