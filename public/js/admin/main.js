$(function () {
    // set default AJAX options
    $.ajaxSetup({ cache: false });
    // activate current navbar item
    $('#navbar-collapse li > a[href!="#"]').each(function () {
        if (window.location.href.indexOf(this.href) > -1) {
            $(this).parent().addClass('active');
            return false;
        }
    });
    // checked/unchecked all table-body checkboxes when table-header checkbox is checked/unchecked
    $(document).on('change', 'th > :checkbox', function () {
        var checkbox = $(this), 
            index = checkbox.parent().index();
        checkbox.closest('table').find('tr').each(function () {
            $('td:eq(' + index + ') > :checkbox:not(:disabled)', this).prop('checked', checkbox[0].checked);
        });
    });
    // cache last opened tab
    $('a[data-toggle=tab]').on('shown.bs.tab', function () {
        localStorage.setItem('tab-open', $(this).attr('href'));
    });
    // open last opened tab
    var tab = localStorage.getItem('tab-open');
    if (tab) {
        $('a[href="' + tab + '"]').tab('show');
    }
    // set default bootbox options
    bootbox.setDefaults({ onEscape: true, size: 'small' });
    // small plugin for creating confirm dialogs on the fly
    // @usage: $.deletebox(options)
    $.deletebox = function (options) {
        bootbox.dialog({
            title: options.title,
            message: options.message,
            buttons: {
                cancel: {
                    label: 'Cancel',
                    className: 'btn-sm'
                },
                danger: {
                    label: 'Delete',
                    className: 'btn-sm btn-danger',
                    callback: function (result) {
                        if (result) {
                            options.callback();
                        }
                    }
                }
            }
        });
    };
    // small plugin for building circle buttons
    // @usage: $(selector).buttonCircle()
    $.fn.buttonCircle = function () {
        // create buttons
        this.find(':checkbox[data-label]').each(function () {
            var input = $(this),
                label = $('<label/>', { html: this.dataset.label }),
                btn = $('<div/>', { class: 'btn-circle' + (this.checked ? ' active' : '') })
            input.wrap(btn).before(label);
        });
        // toggle buttons
        return this.on('click', '.btn-circle', function () {
            var btn = $(this),
                input = btn.find(':checkbox');
            input.prop('checked', !input.is(':checked'));
            btn.toggleClass('active', input.is(':checked'));
            // expect other inputs to be checked if name ends with []
            if (input.attr('name').endsWith('[]')) return;
            // otherwise uncheck other inputs having the same name
            $('.btn-circle > input[name="' + input.attr('name') + '"]').not(input).each(function () {
                $(this).prop('checked', false).parent().removeClass('active');
            });
        });
    };
});