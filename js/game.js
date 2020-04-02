var match = null;
var match_id = Util.getParam("match");
var database = new GameFirebase();
var game_reset = true;
var turns_applied = 0;

var total_scores = [0, 0, 0, 0];

database.authenticate((_auth_user) => {
	auth_user = _auth_user;

	database.listenMatch(match_id, async (_match) => {
		match = _match;

		if (game_reset) {
			initGame();
		}

		if (turns_applied > match.turns.length) {
			turns_applied = 0;
			$('.data-row').remove();
			total_scores = [0, 0, 0, 0];
		}

		for (; turns_applied < match.turns.length;) {
			let scores = Util.unpack(match.turns[turns_applied]);
			
			let scores_html = scores.map(score => {
				if (score > 0) score = '+' + score;
				else if (score == 0) score = '';
				return `<td>${ score }</td>`;
			});

			$(`<tr class='data-row' onclick='onRowClicked(event)'> ${scores_html} </tr>`).insertBefore($('#match-table #total-scores'));

			for (let i = 0; i < total_scores.length; i++)
				total_scores[i] += parseInt(scores[i]);

			let total_scores_html = total_scores.map(score => {
				if (score > 0) score = '+' + score;
				else if (score == 0) score = '';
				return `<td>${ score }</td>`;
			});

			$('#match-table #total-scores').html(
				`${total_scores_html}`
			);

			turns_applied ++;
		}
	});
});


//Game
function initGame() {
	$('#new-row-btn').on('click', () => {
		$('#new-row-modal').modal('show');
	});

	$('#new-row-submit-btn').on('click', () => {
		let scores = $.map($('#new-row-modal input'), e => {
			let val = parseInt(e.value);
			return val ? val : 0;
		});
		$('#new-row-modal input').val('');
		database.addTurn(scores);
		$('#new-row-modal').modal('hide');
	});

	$('#home-btn').on('click', (e) => {
		window.location = WEB_URL + "/";
	});


	showHtml('#floating-toolbar .btn', true);
	game_reset = false;
}

function showHtml(button, toShow) {
	$(button).toggleClass('hidden', !toShow);
}

function enableHtml(button, toEnable) {
	if (toEnable) {
		$(button).removeAttr('disabled');		
	}
	else {
		$(button).attr('disabled', 'disabled');
	}
}

function htmlEnabled(button) {
	return $(button).attr('disabled') != 'disabled';
}

function onRowClicked(e) {
	let parent = $(e.target.parentNode);
	let grand = $(e.target.parentNode.parentNode);
	let index = grand.children().index(parent);

	swal({
		text: `刪除？`,
		type: "warning",
		showCancelButton: true,
		buttons: [
		  '取消',
		  '刪除'
		],
		closeOnConfirm: false
	}).then((confirm) => {
		if (confirm) {
			database.removeTurn(index);
		}
	});
}
