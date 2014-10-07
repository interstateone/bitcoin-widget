/*
 This file was generated by Dashcode.
 You may edit this file to customize your widget or web page
 according to the license.txt file included in the project.
 */

var tickerValues = {
    high: 0,
    low: 0,
    volume: 0,
    buy: 0,
    sell: 0,
    last: 0,
    currency: "usd"
};

var currencies = {
    usd: "$",
    cad: "$",
    gbp: "£",
    eur: "€",
    btc: "฿",
    jpn: "¥",
    aud: "$"
}

var sources = {
    btceUSD: {
        name: "BTC-e USD",
        url: "https://btc-e.com/api/2/btc_usd/ticker",
        fetchMethod: getBtcE
    },
    bitstampUSD: {
        name: "Bitstamp USD",
        url: "https://www.bitstamp.net/api/ticker/",
        fetchMethod: getBitstamp
    },
    coinbaseUSD: {
        name: "Coinbase USD",
        url: {  spot : "https://coinbase.com/api/v1/prices/spot_rate",
                buy: "https://coinbase.com/api/v1/prices/buy", 
                sell: "https://coinbase.com/api/v1/prices/sell" },
        fetchMethod: getCoinbase
    },
    btcmarketsAUD: {
        name: "BTC Markets AUD",
        url: "https://api.btcmarkets.net/market/BTC/AUD/tick",
        fetchMethod: getBTCMarkets
    }
};

// added by @alexius2
function getBtcE(url, callback) {
    $.getJSON(url, function(json) {
        callback({
            last: json.ticker.last,
            high: json.ticker.high,
            low: json.ticker.low,
            buy: json.ticker.buy,
            sell: json.ticker.sell,
            volume: json.ticker.vol_cur,
            currency: 'USD',
            timestamp: json.ticker.updated
        });
    });
}

// added by @Enzese
function getBitstamp(url, callback) {
    $.getJSON(url, function(json) {
        callback({
            last: json.last,
            high: json.high,
            low: json.low,
            buy: json.bid,
            sell: json.ask,
            volume: json.volume,
            currency: 'USD',
            timestamp: json.timestamp
        });
    });
}

// added by @Enzese
function getCoinbase(url, callback) {
    var results = {
        last: '',
        high: '',
        low: '',
        buy: '',
        sell: '',
        currency: 'usd'
    };
    // get buy amount
    $.getJSON(url.buy, function(json) {
        results.buy = json.amount;

        // get sell amount
        $.getJSON(url.sell, function(json) {
            results.sell = json.amount;
                
            // get spot amount 
            $.getJSON(url.spot, function(json) {
                results.last = json.amount;
                callback(results);
            });
        });
    });
}

function getBTCMarkets(url, callback) {
    $.getJSON(url, function(json) {
        callback({
            last: json.lastPrice,
            buy: json.bestBid,
            sell: json.bestAsk,
            currency: json.currency,
            timestamp: json.timestamp
        });
    });
}

function formatNumber(value, decimalPlaces) {
    if (value) {
        return Number(value).toFixed(decimalPlaces);
    } else {
        return "";
    }
}

function formatCurrency(value) {
    symbol = currencies[tickerValues.currency.toLowerCase()];
    return symbol + formatNumber(value, 2);
}

function refreshTickerValues() {
    var key = widget.preferenceForKey("sourceKey"),
        source = sources[key];

    if (!key || !source) {
        key = $("#sourcePopup").val();
    }

    source.fetchMethod(source.url, function(data) {
        _.extend(tickerValues, data);
        showTickerValues();
    });
}

function showTickerValues() {
    $('#ticker_high').html(formatNumber(tickerValues.high, 2));
    $('#ticker_low').html(formatNumber(tickerValues.low, 2));
    $('#ticker_last').html(formatCurrency(tickerValues.last));
    $('#ticker_buy').html(formatNumber(tickerValues.buy, 2));
    $('#ticker_sell').html(formatNumber(tickerValues.sell, 2));
    $('#buyLabel').html(getLocalizedString('buy'));
    $('#sellLabel').html(getLocalizedString('sell'));
}

function populateSourcePicker() {
    var sourcePopup = $("#sourcePopup");
    _.each(sources, function(source, key) {
        $("<option>").text(source.name).attr("value", key).appendTo(sourcePopup);
    });
}

//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//
function load() {
    dashcode.setupParts();

    populateSourcePicker();
    $("#sourcePopup").change(function() {
        widget.setPreferenceForKey($(this).val(), "sourceKey");
        refreshTickerValues();
    }).val(widget.preferenceForKey("sourceKey"));
}

//
// Function: remove()
// Called when the widget has been removed from the Dashboard
//
function remove() {
    // Stop any timers to prevent CPU usage
    // Remove any preferences as needed
}

//
// Function: hide()
// Called when the widget has been hidden
//
function hide() {
    // Stop any timers to prevent CPU usage
}

//
// Function: show()
// Called when the widget has been shown
//
function show() {
    // Restart any timers that were stopped on hide
    refreshTickerValues();
    $('#done').text(getLocalizedString('done'));
}

//
// Function: sync()
// Called when the widget has been synchronized with .Mac
//
function sync() {
    // Retrieve any preference values that you need to be synchronized here
    // Use this for an instance key's value:
    // instancePreferenceValue = widget.preferenceForKey(null, dashcode.createInstancePreferenceKey("your-key"));
    //
    // Or this for global key's value:
    // globalPreferenceValue = widget.preferenceForKey(null, "your-key");
}

//
// Function: showBack(event)
// Called when the info button is clicked to show the back of the widget
//
// event: onClick event from the info button
//
function showBack(event) {
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }

    front.style.display = "none";
    back.style.display = "block";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

//
// Function: showFront(event)
// Called when the done button is clicked from the back of the widget
//
// event: onClick event from the done button
//
function showFront(event) {
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToFront");
    }

    front.style.display="block";
    back.style.display="none";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
        refreshTickerValues();
    }
}

if (window.widget) {
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
    widget.onsync = sync;
}