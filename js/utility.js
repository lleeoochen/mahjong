class Util {

	// https://stackoverflow.com/a/21903119
	static getParam(sParam) {
	    var sPageURL = window.location.search.substring(1),
	        sURLVariables = sPageURL.split('&'),
	        sParameterName,
	        i;

	    for (i = 0; i < sURLVariables.length; i++) {
	        sParameterName = sURLVariables[i].split('=');

	        if (sParameterName[0] === sParam) {
	            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
	        }
	    }
	}

	static pack(turn) {
		return turn.toString();
	}

	static unpack(data) {
		return data.split(',');
	}

	static vw2px(v) {
		return v * document.documentElement.clientWidth / 100;
	}

	static vh2px(v) {
		return v * document.documentElement.clientHeight / 100;
	}

	static reloadStylesheets() {
	    var queryString = '?reload=' + new Date().getTime();
	    $('link[rel="stylesheet"]').each(function () {
	        this.href = this.href.replace(/\?.*|$/, queryString);
	    });
	}

	// https://stackoverflow.com/a/8888498
	static formatDate(date) {
		var strTime = (date.getMonth() + 1) + "/" + date.getDate() + ", " + WEEKDAY[date.getDay()];
		return strTime;
	}

	static formatTimer(timer) {
		let min = Math.floor(timer / 60);
		let sec = timer - min * 60;
		min = min < 10 ? '0' + min : min;
		sec = sec < 10 ? '0' + sec : sec;
		return min + ":" + sec;
	}
}
