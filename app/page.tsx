import Image from "next/image";

const stories = [
  {
    id: "welcome", label: "The club", title: "It starts with a walk.",
    body: "There’s always someone who knows where the path forks, and someone seeing it for the first time. At Fernloop, they walk together. Pick a familiar loop, agree on a meeting spot, and leave a little time for the view.",
    image: "walkers", alt: "Two walkers carrying packs along a mountain trail",
  },
  {
    id: "walks", label: "On the trail", title: "Give the walk a question.",
    body: "Where does the birdsong get loudest? What grows on the shady side of the path? Choose one thing to look for before you set off. Compare what you noticed when you stop for tea.",
    image: "woodland", alt: "Afternoon light filtering through trees onto a woodland path",
  },
  {
    id: "notes", label: "Field notes", title: "Bring a detail back.",
    body: "A pencil sketch of a crooked pine. Three words for the colour of the lake. A note about the bench that catches the morning sun. Trade a page with a walking companion so you each go home with a second view of the same place.",
    image: "lakeside", alt: "A timber boathouse reflected in a still mountain lake",
  },
];

export default function Home() {
  return (
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <Image className="hero-photo" src="/walking-club/valley.webp" alt="" fill sizes="100vw" preload />
        <div className="shell hero-content">
          <p className="eyebrow hero-label">Community walks</p>
          <h1 id="hero-title">Good company.<br /><em>Open country.</em></h1>
          <p className="hero-intro">Take the long way with Fernloop. Share a trail, swap field notes, and get to know the people walking beside you.</p>
          <a href="#welcome" className="button light">Discover the club</a>
        </div>
      </section>
      <div className="shell stories">
        {stories.map((story) => (
          <section className="story" id={story.id} key={story.id}>
            <div className="story-copy">
              <p className="eyebrow">{story.label}</p>
              <h2>{story.title}</h2>
              <p>{story.body}</p>
            </div>
            <Image className="story-photo" src={'/walking-club/' + story.image + '.webp'} width={1080} height={780} sizes="(max-width: 720px) 92vw, 46vw" alt={story.alt} />
          </section>
        ))}
      </div>
      <section className="pace">
        <div className="shell pace-inner">
          <h2>Set your own pace.</h2>
          <p>Ten minutes around the block counts. So does a whole afternoon on the ridge. Choose a route everyone can enjoy, then let the slowest walker call the first stop.</p>
        </div>
      </section>
      <section id="cta" className="invitation">
        <div className="shell">
          <h2>See you at the trailhead.</h2>
          <p>Verify your phone number to join the Fernloop whitelist.</p>
          <a href="/join" className="button light">Join the whitelist</a>
        </div>
      </section>
    </main>
  );
}
