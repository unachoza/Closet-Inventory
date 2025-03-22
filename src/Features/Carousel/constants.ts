// Carousel categories
const categories = [
	{ label: "Tops", icon: "👕" },
	{ label: "Bottoms", icon: "👖" },
	{ label: "Dresses", icon: "👗" },
	{ label: "Coats", icon: "🧥" },
	{ label: "Sweaters", icon: "🧶" },
	{ label: "Lingerie", icon: "💃" },
	{ label: "Socks", icon: "🧦" },
	{ label: "Underwear", icon: "🩲" },
];

export const closetImg =
	"https://images.unsplash.com/photo-1585914924626-15adac1e6402?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const artImages = {
	standingInHeels: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/52ce61c/2147483647/strip/true/crop/3339x4389+0+0/resize/800x1052!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2F12%2F22%2F10b048a446af994d02532a1fe86f%2Fn11753-d7vym-t2-02-cropped1.jpg",
		category: "women",
		title: "Helena, Hollywood",
	},
	dinningWithNails: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/f49f918/2147483647/strip/true/crop/2000x1995+0+0/resize/800x798!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Fdc%2F5f%2F48530b594baf86b76b52b5c126b6%2Fn11753-brqz8-t2-02-a.jpg",
		category: "women",
		title: "Kylie Baxx, Hotel Hermitage",
	},
	bushAgainstTheWall: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/7a3a81f/2147483647/strip/true/crop/1862x2000+0+0/resize/800x859!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Ffe%2F70%2F7da9c89a47d28ba0244fd522ad02%2Fn11753-d8k2s-t2-02-a.jpg",
		category: "women",
		title: "Sylvia in my studio, Paris",
	},
	boyWithShotgun: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/881340a/2147483647/strip/true/crop/3374x4199+0+0/resize/800x996!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fd3%2Fc2%2F98e054de4265b7fafd499626aa87%2Fn11753-d792m-t1-02-a1.jpg",
		category: "guns",
		title: "B.J. Van Fleet, nine years old, Ennis Montana, 1982",
	},
	underTheCovers: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/af2b691/2147483647/strip/true/crop/2000x1633+0+0/resize/800x653!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Fa3%2F87%2F10950d824a55b455a5b6467078b2%2Fn11753-6yhsf-t3-02-a.jpg",
		category: "women",
		title: "Naptime",
	},
	redwoodForrest: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/7954277/2147483647/strip/true/crop/2000x1629+0+0/resize/800x652!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2F78%2Fbe%2F0fc95c8440bfa14b88c16ebce12b%2Fn11753-d67cw-t2-02-a.jpg",
		category: "trees",
		title: "North Redwood, California",
	},
	throughThePeephole: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/d421d70/2147483647/strip/true/crop/2000x1345+0+0/resize/800x538!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Fcc%2Fa4%2F534b159c4776a56281d3b78a8a40%2Fn11753-d4rgx-t3-02-a.jpg",
		category: "women",
		title: "Calle Cuauhtemoctzin, Mexico City",
	},

	windingStaircase: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/21f2e17/2147483647/strip/true/crop/2000x1362+0+0/resize/800x545!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Fa0%2F02%2Fdce0fe4e407c91cad8f815072d9d%2Fn11753-d4rh5-t3-02-a.jpg",
		category: "village outside",
		title: "Hyeres, France",
	},
	salon: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/d74825c/2147483647/strip/true/crop/2000x1588+0+0/resize/800x635!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Fbd%2F3a%2Fc8ce158041feac4dc32cbcbbb0d8%2Fn11753-cl3n7-t2-02-a.jpg",
		category: "empty inside",
		title: "Room 110, Holiday Inn Bernaid Minnesota 1973",
	},
	dirtRoad: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/224b580/2147483647/strip/true/crop/2000x1624+0+0/resize/800x650!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2F9f%2F5f%2F3ca822cb41b088246578b9ede80e%2Fn11753-d7f86-t3-02-a.jpg",
		category: "empty outside",
		title: "Presidio Texas, 1975",
	},
	dressTooBig: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/af511c5/2147483647/strip/true/crop/2000x1329+0+0/resize/800x532!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Fe5%2Fd5%2Fb73585154381bb5ffa1397be82e5%2Fn11753-9kfxk-bi-20.jpg",
		category: "inside",
		title: "Versailles",
	},
	handful: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/d148863/2147483647/strip/true/crop/1722x1578+0+0/resize/800x733!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Fc3%2F9a%2F007fbac2470b815d9d2cb80e6100%2Fn11753-7nfkc-t1-01-a.jpg",
		category: "women",
		title: "untitled",
	},
	huddleUp: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/f6485c2/2147483647/strip/true/crop/2000x1604+0+0/resize/800x642!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2F78%2F09%2Fbcf56c494cec930d60a12b29bf8d%2Fn11753-d2kfj-t3-02-a.jpg",
		category: "women",
		title: "Sephanie, Cindy, Tatjana, Naomi 2, Hollywood",
	},
	mirrorImage: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/170d03b/2147483647/strip/true/crop/2000x1337+0+0/resize/800x535!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Fb3%2Ff3%2F7e8996d74ab9bf7e9759d558a2da%2Fn11753-d7rtf-bi-cropped.jpg",
		category: "women",
		title: "French Vogue, 1977",
	},
	seaAura: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/a2b7f43/2147483647/strip/true/crop/2000x1588+0+0/resize/800x635!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Fb3%2F6f%2F118d07944a008ebdab518cf173cd%2Fn11753-d7mh9-t2-02-a.jpg",
		category: "empty ouside",
		title: "Salton Sea (Red)",
	},
	runningStairs: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/b4df858/2147483647/strip/true/crop/2000x1347+0+0/resize/800x539!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Fed%2Fe4%2F5acf4405495a894d239365d052b4%2Fn11753-d4rh4-t2-02-a.jpg",
		category: "outside",
		title: "Siphanos Greece",
	},
	damselInDistress: {
		link: "https://sothebys-md.brightspotcdn.com/dims4/default/a24a9f5/2147483647/strip/true/crop/1976x2000+0+0/resize/800x810!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2Fwebnative%2Fimages%2Fdb%2Fe5%2Fa1e8ddfb4754836c1195efed078f%2Fn11753-d5dbv-t3-02-a.jpg",
		category: "outside women",
		title: "Charles Jourdan Autumn 1970",
	},
};
