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

    // wrap tables with  special container 
    $('.dim, .stretch').each(function() {
        var elem = $(this), div = $('<div/>');
        if (elem.hasClass('stretch')) {
            div.addClass('stretch-wrap');
        }
        if (elem.hasClass('dim')) {
            div.addClass('dim-wrap');
        }
        elem.wrap(div);

        if (elem.hasClass('dim')) {
            elem.after('<div class="dimmer"></div>'); // overlay
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

    // style checkboxes with switch control
    $(":checkbox.bootstrap-switch").bootstrapSwitch({
        inverse: true,
        offText: 'No',
        onText: 'Yes',
        size: 'small'
    });

    // save last opened tab
    $('a[data-toggle=tab]').on('shown.bs.tab', function () {
        localStorage.setItem('tab-open', $(this).attr('href'));
    });
    // open last opened tab
    var tab = localStorage.getItem('tab-open');
    if (tab) {
        $('a[href="' + tab + '"]').tab('show');
    }

    // toggle checkbox-radios
    $(document).on('click', '.btn-circle', function (e) {
        var btn = $(this).toggleClass('active'), 
            input = $('input', btn).prop('checked', btn.hasClass('active'));
        // inactivate other checkbox-radios if they belong to the same group
        if (input.data('group')) {
            $(e.delegateTarget).find('.btn-circle').has('[data-group=' + input.data('group') + ']').not(btn).each(function () {
                $(this).removeClass('active').find('input').prop('checked', false);
            });
        }
    // create checkbox-radios
    }).find(':checkbox[data-label]').each(function() {
        $(this)
            .wrap('<div class="btn-circle' + (this.checked ? ' active' : '') + '"></div>')
            .before('<label>' + this.dataset.label + '</label>');
    });

    // small plugins for making PUT and DELETE requests
    // @usage: $.put(url, data, callback) or $.delete(url, callback)
    $.each(['put', 'delete'], function (i, method) {
        $[method] = function (url, data, callback, type) {
            if ($.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            return $.ajax({
                url: url,
                type: method,
                dataType: type,
                data: data,
                success: callback
            });
        };
    });

    // small plugin for showing/hiding selector and enabling/disabling its children
    // @usage: $(selector).enableToggle([display])
    $.fn.enableToggle = function () {
        return this.toggle.apply(this, arguments).promise().done(function () {
            this.find(':input').prop('disabled', this.is(':hidden'));
        });
    };

    // small plugin for creating alerts on the fly
    // @usage: $.bootstrapAlert(type, msg).after(...)
    $.bootstrapAlert = function () {
        if (arguments[0] === 'close') {
            return $('.alert-dismissible').remove();
        }
        return $('<div/>', {
            class: 'alert alert-' + arguments[0] + ' alert-dismissible',
            html: '<a href="#" class="close" data-dismiss="alert">&times;</a>' + arguments[1]
        });
    };

    // small plugin for creating confirm dialogs on the fly
    // @usage: $.deletebox(options)
    $.deletebox = function (options) {
        bootbox.dialog({
            onEscape: true,
            size: 'small',
            title: options.title,
            message: options.message,
            buttons: {
                cancel: {
                    label: 'Cancel',
                    className: 'btn-sm'
                },
                danger: {
                    label: 'Delete',
                    className: 'btn-danger',
                    callback: function (res) {
                        if (res) {
                            options.callback();
                        }
                    }
                }
            }
        });
    };
});

// tinymce.init({
//     selector: '.tinymce',
//     menubar: false,
//     statusbar: false,
//     plugins: [
//         'advlist autolink lists link image charmap',
//         'searchreplace visualblocks code',
//         'media table contextmenu paste code'
//     ],
//     toolbar: 'styleselect | bullist numlist | charmap link image table | undo redo'
// });