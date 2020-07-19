var match = null;
var match_id = Util.getParam("match");
var database = new GameFirebase();
var game_reset = true;
var turns_applied = 0;

var total_scores = [0, 0, 0, 0];
var starting_master = 0;
var master = 0;
var round = 0;

database.authenticate((_auth_user) => {
	auth_user = _auth_user;

	database.listenMatch(match_id, async (_match) => {
		match = _match;

		if (game_reset) {
			initGame();
		}

		if (match.names) {
			updateNames(match.names);
		}

		if (turns_applied > match.turns.length) {
			turns_applied = 0;
			$('.data-row').remove();
			total_scores = [0, 0, 0, 0];
			master = 0;
			round = 0;
			$('#match-table #total-scores').html('');
		}

		for (; turns_applied < match.turns.length;) {
			let scores = Util.unpack(match.turns[turns_applied]);

			let scores_html = scores.map((score, i) => {
				if (score > 0) score = '+' + score;
				else if (score == 0) score = '';
				return `<td class="${ i == master ? 'master' : '' }">${ score }</td>`;
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

			// console.log("==========");
			// console.log("master:", master);
			// console.log("round:", round);

			// await new Promise((resolve) => {
			//     setTimeout(() => { resolve() }, 1000)
			// });

			// If master doesn't win, rotate master.
			if (scores[master] <= 0) {
				master = (master + 1) % scores.length;

				// Advance round
				if (master == starting_master) {
					round ++;
				}
			}

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
			let sign = $(e).parent().find('img').attr('src') == 'assets/minus.png' ? -1 : 1;

			let val = parseInt(e.value);
			return val ? sign * Math.abs(val) : 0;
		});

		// Make sure they sum to 0
		if (scores.reduce((total, i) => total += i) != 0) {
			return false;
		}

		$('#new-row-modal input').val('');
		$('#new-row-modal .sign-btn img').attr('src', 'assets/minus.png');
		database.addTurn(scores);
		$('#new-row-modal').modal('hide');
	});

	$('#rules-btn').on('click', () => {
		$('#rules-modal').modal('show');
	});

	$('#home-btn').on('click', (e) => {
		window.location = WEB_URL + "/";
	});

	$('.form-control.name').on('change', (e) => {
		let names = [
			$('#p1-name-input').val(),
			$('#p2-name-input').val(),
			$('#p3-name-input').val(),
			$('#p4-name-input').val()
		];
		database.updateNames(names);
	});

	$('.form-control.name').on('focus', (e) => {
		$(e.target).css('background-color', 'white');
	});

	$('.form-control.name').on('focusout', (e) => {
		$(e.target).css('background-color', 'transparent');
	});

	$('.sign-btn img').on('click', (e) => {
		if ($(e.target).attr('src') == 'assets/plus.png')
			$(e.target).attr('src', 'assets/minus.png');
		else
			$(e.target).attr('src', 'assets/plus.png');
	});

	$('#summarize-btn').on('click', (e) => {
		$('#total-scores').toggleClass('hidden');
	});

	showHtml('#floating-toolbar .btn', true);
	game_reset = false;
}

function updateNames(names) {
	$('#p1-name-input').val(names[0]);
	$('#p2-name-input').val(names[1]);
	$('#p3-name-input').val(names[2]);
	$('#p4-name-input').val(names[3]);

	$('#p1-name').text(names[0]);
	$('#p2-name').text(names[1]);
	$('#p3-name').text(names[2]);
	$('#p4-name').text(names[3]);
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
