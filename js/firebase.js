// Base class of database storage
class Firebase {
	// db = null;
	// auth_user = null;

	constructor() {
		this.db = null;
		this.auth_user = null;

		// General Init
		var firebaseConfig = {
			apiKey: "AIzaSyDu8L2m1ATtQLeyk8eL1_993ubhZDT-jik",
			authDomain: "mahjong-score-tracker.firebaseapp.com",
			databaseURL: "https://mahjong-score-tracker.firebaseio.com",
			projectId: "mahjong-score-tracker",
			storageBucket: "mahjong-score-tracker.appspot.com",
			messagingSenderId: "522501511228",
			appId: "1:522501511228:web:c2d62e31ea786d4e37cb39",
			measurementId: "G-YPHMB3HJL7"
		};
		firebase.initializeApp(firebaseConfig);
		this.db = firebase.firestore();

		// Authentication Init
		let firebaseAuthConfig = {
			signInSuccessUrl: window.location.href,
			signInOptions: [
				firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			],
			tosUrl: 'www.bing.com',
			privacyPolicyUrl: function() {
				window.location.assign('www.google.com');
			}
		};
		let ui = new firebaseui.auth.AuthUI(firebase.auth());
		ui.start('#firebaseui-auth-container', firebaseAuthConfig);
	}

	authenticate(callback) {
		var self = this;

		firebase.auth().onAuthStateChanged(function(auth_user) {
			if (auth_user) {
				self.auth_user = auth_user;
				self.db.collection(USERS_TABLE).doc(self.auth_user.uid).set({
					email: self.auth_user.email,
					photo: self.auth_user.photoURL,
					name: self.auth_user.displayName
				}, { merge: true });
				callback(self.auth_user);
			}
			else {
				$('#modal').modal({ backdrop: 'static', keyboard: false })
			}
		});
	}

	getMatch(id, callback) {
		this.db.collection(MATCHES_TABLE).doc(id).get().then(doc => {
			console.log("Match get: ", doc.data());
			callback(doc.data());
		});
	}

	getMatches(ids, user, callback) {
		let total = Math.ceil(ids.length / 10);
		let sent = 0;
		let result = [];
		var self = this;

		for (let i = 0; i < total; i++) {
			var data = ids.slice(i * 10, i * 10 + 10);
			this.db.collection(MATCHES_TABLE).where(firebase.firestore.FieldPath.documentId(), "in", data).get().then(async snapshot => {
				await snapshot.forEach(function(doc) {
					let id = (self.auth_user.uid == doc.data()["black"]) ? doc.data()["white"] : doc.data()["black"];

					if (id) {
						self.getUser(id).then((user) => {
							result.push([doc.id, doc.data(), user]);
							sent ++;

							if (sent == ids.length) {
								callback(result);
							}
						});
					}
					else {
						sent ++;
						result.push([doc.id, doc.data(), null]);
						if (sent == ids.length) {
							callback(result);
						}
					}
				});
			});
		}
	}

	getUser(id) {
		return this.db.collection(USERS_TABLE).doc(id).get().then(doc => {
			console.log("User get: ", doc.data());
			return doc.data();
		});
	}

	listenMatch(id, callback) {
		this.db.collection(MATCHES_TABLE).doc(id).onSnapshot(function(doc) {
			console.log("Match updated: ", doc.data());
			callback(doc.data());
		});
	}

	listenUser(id, callback) {
		this.db.collection(USERS_TABLE).doc(id).onSnapshot(function(doc) {
			console.log("User updated: ", doc.data());
			callback(doc.data());
		});
	}

	createMatch(user, callback) {
		let self = this;

		this.db.collection(MATCHES_TABLE).add({
			turns: [],
			updated: new Date(),
		})
		.then(async function(ref) {
			let matches = (user && user.matches) ? user.matches : [];
			matches.push(ref.id);

			await self.db.collection(USERS_TABLE).doc(self.auth_user.uid).set({
				matches: matches
			}, { merge: true });

			callback(ref.id);
		})
	}
}
