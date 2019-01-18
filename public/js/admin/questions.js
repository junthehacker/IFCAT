$(function () {
    // Drag and drop rows
    $('tbody').sortable({ axis: 'y', cancel: false, handle: '.handle' });

    // Create hidden fields to store editable text
    $('code[contenteditable][data-name]').each(function () {
        $(this).after($('<input/>', { type: 'hidden', name: this.dataset.name, value: this.innerText }))
    // Store editable text upon typing into editable text
    }).on('input', function () {
        $(this).next(':hidden').val(this.innerText);
    });
    // Change DOM upon changing question type
    $('select[name=type]').change(function () {
        var select = this;
        $('.form-group[data-type]').each(function () {
            var display = this.dataset.type.indexOf(select.value) > -1;
            $(this).toggle(display).find(':input').prop('disabled', !display);
        });
    }).change();
    // Toggle checkboxes for selecting/unselecting files
    $('#modal-show-files .list-group-item :checkbox').click(function () {
        $(this).closest('.list-group-item').toggleClass('active', this.checked);
    });
    // Open media in preview window
    $('#modal-show-files .list-group-item:has(.preview) a').click(function (e) {
        e.preventDefault();
        $(this).closest('.modal-body').find('.col-preview').html(
            $(this).next('.preview').clone().css('display', '')
        );
    });
    // Update file counter
    $('#modal-show-files').on('hidden.bs.modal', function () {
        var count = $(this).find(':checked').length;
        $('.counter.files').text(count !== 1 ? count + ' files selected' : '1 file selected');
    });
    // Add new link input
    $('#btn-add-link').click(function () {
        var template = $(this).closest('.form-group').prev(),
            clone = template.clone().toggle(true);
        template.before(clone);
    });
    // Change link counter
    $('#modal-show-links').on('hidden.bs.modal', function () {
        var count = 0;
        $('[name^=_links]', this).each(function() {
            count += $.trim(this.value) !== '' ? 1 : 0;
        });
        $('.counter.links').text(count + ' link' + (count !== 1 ? 's' : '') + ' added');
    });
    // Remove choice input
    $(document).on('click', '.btn-remove-choice', function () {
        $(this).closest('.input-group').remove();
    });
    // Add choice input
    var id = 999;
    $('.btn-add-choice').click(function () {
        var template = $(this).closest('.form-group').prev(),
            clone = template.clone();
        clone.attr('style', "");
        clone.find('textarea').attr('name', function () {
            return this.name.replace(/\[\]$/, '[' + (++id) + ']');
        });
        clone.find(':radio, :checkbox').val(id);
        template.before(clone);
    });
    // @todo: fix points previewer
    $(document).on('change', '[name=points], [name=firstTryBonus], [name=penalty]', function () {
        var points = _.defaultTo(_.toNumber($('[name=points]').val()), 0),
            firstTryBonus = _.defaultTo(_.toNumber($('[name=firstTryBonus]').val()), 0),
            penalty = _.defaultTo(_.toNumber($('[name=penalty]').val()), 0);
        var table = '';

        if (points > 0 && penalty > 0) {
            var attempts = [];
            // bug: flawed point system
            var first = true;
            while (points > 0) {
                if (first) {
                    attempts.push(points + firstTryBonus);
                    first = false;
                } else {
                    attempts.push(points);
                }
                points -= penalty;
            }

            table  = '<table class="table table-striped table-bordered" style="min-width: auto; width: 200px">';
            for (var j = 0, len = attempts.length; j < len; j++)
                table += '<tr><td>Attempt #' + (j + 1) + '</td><td>' + attempts[j] + '</td></tr>';
            table += '</table>';
        }
        // add table
        $('#points-calculator').html(table);
    });
});