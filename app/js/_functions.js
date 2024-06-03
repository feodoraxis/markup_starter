export function is_mobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}
export function is_OSX() {
    return navigator.platform.match(/(Mac|iPhone|iPod|iPad|Android)/i)
        ? true
        : false;
}
export function before_modal_open() {
    let css = {
        overflow: "hidden",
    };

    $("html").css(css);

    if (!is_mobile() && !is_OSX()) {
        css["padding-right"] = "17px";
    }

    $("body").css(css);
}

export function after_modal_close() {
    $("html,body").removeAttr("style");
}

export function modal_open(selector) {
    before_modal_open();
    $(selector).addClass("open");
}

export function modal_close(selector) {
    $(selector).removeClass("open");
    after_modal_close();
}

export function plural_format_word(number, after) {
    const cases = [2, 0, 1, 1, 1, 2];

    return (
        number +
        " " +
        after[
            number % 100 > 4 && number % 100 < 20
                ? 2
                : cases[Math.min(number % 10, 5)]
        ]
    );
}

export function serializedArrayToUrlSerialize(array) {
    let output = "";

    array.map((element) => {
        if (output !== "") {
            output += "&";
        }

        output +=
            element["name"].replace("[", "%5B").replace("]", "%5D") +
            "=" +
            element.value;
    });

    return output;
}

export function reverseArr(input) {
    var ret = new Array();
    for (var i = input.length - 1; i >= 0; i--) {
        // ret.push(input[i]);
        ret[i] = input;
    }
    return ret;
}
