<?php
/**
 * De homepage.
 *
 * Zelfde opbouw als de demo die Ruth goedkeurde: grote foto, merkenslider,
 * producten, haar verhaal, waarom deze shop, socials en de nieuwsbrief.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$shop     = cbr_shop_actief();
$hero_id  = get_theme_mod( 'cbr_hero_image' );
$hero_kop = get_theme_mod( 'cbr_hero_kop', get_bloginfo( 'name' ) );
$hero_sub = get_theme_mod( 'cbr_hero_sub', 'Your curls, your confidence.' );
?>

<section class="hero<?php echo $hero_id ? ' hero--foto' : ''; ?>">
	<?php if ( $hero_id ) : ?>
		<?php
		echo wp_get_attachment_image(
			$hero_id,
			'full',
			false,
			array(
				'class'         => 'hero__img',
				'alt'           => '',
				'fetchpriority' => 'high',
			)
		);
		?>
	<?php endif; ?>

	<div class="hero__copy">
		<h1 class="hero__title serif"><?php echo esc_html( $hero_kop ); ?></h1>
		<p class="hero__sub"><?php echo esc_html( $hero_sub ); ?></p>
		<?php if ( $shop ) : ?>
			<a class="btn hero__btn" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Shop nu</a>
		<?php endif; ?>
	</div>
</section>

<?php
/* ---------------- merkenslider ---------------- */
$merken = cbr_merken();

if ( count( $merken ) > 1 ) :
	?>
	<section class="brands" aria-roledescription="carrousel" aria-label="Onze merken">
		<div class="brands__track" data-brand-track>
			<?php foreach ( $merken as $merk ) : ?>
				<article class="bslide" style="background:<?php echo esc_attr( $merk['zacht'] ); ?>"
				         role="group" aria-roledescription="dia" aria-label="<?php echo esc_attr( $merk['naam'] ); ?>">
					<div class="bslide__inner">
						<div class="bslide__copy">
							<span class="bslide__label">Onze merken</span>
							<h2 class="bslide__name"><?php echo esc_html( $merk['naam'] ); ?></h2>
							<p class="bslide__meta">
								<?php
								printf(
									'%d %s in het assortiment',
									(int) $merk['aantal'],
									1 === (int) $merk['aantal'] ? 'product' : 'producten'
								);
								?>
							</p>
							<a class="btn" href="<?php echo esc_url( $merk['link'] ); ?>">
								Bekijk <?php echo esc_html( $merk['naam'] ); ?>
							</a>
						</div>

						<div class="bslide__visual">
							<?php if ( $merk['foto'] ) : ?>
								<?php echo wp_get_attachment_image( $merk['foto'], 'large', false, array( 'alt' => '' ) ); ?>
							<?php else : ?>
								<div class="bslide__ph">
									<svg viewBox="0 0 52 72" fill="none" stroke="<?php echo esc_attr( $merk['donker'] ); ?>"
									     stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
										<path d="M20 3h12v7l6 7v48a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V17l6-7V3z"/>
										<path d="M14 33h24"/>
									</svg>
									<span class="bslide__note">Merkfoto volgt</span>
								</div>
							<?php endif; ?>
						</div>
					</div>
				</article>
			<?php endforeach; ?>
		</div>

		<div class="brands__controls">
			<div class="brands__dots" data-brand-dots></div>
			<div class="brands__progress" aria-hidden="true"><i></i></div>
			<div class="brands__arrows">
				<button class="arrow-btn" data-brand-prev aria-label="Vorig merk">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>
				</button>
				<button class="arrow-btn" data-brand-next aria-label="Volgend merk">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
				</button>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php
/* ---------------- alle producten ---------------- */
$producten = array();

if ( $shop ) {
	$producten = wc_get_products(
		array(
			'status'  => 'publish',
			'limit'   => 12,
			'orderby' => 'menu_order',
			'order'   => 'ASC',
		)
	);
}

if ( $producten ) :
	?>
	<section class="section">
		<div class="wrap">
			<div class="sec-head sec-head--center">
				<span class="eyebrow">Assortiment</span>
				<h2>Onze producten</h2>
				<p>Zorgvuldig geselecteerd voor krullend haar.</p>
			</div>

			<ul class="product-grid">
				<?php
				global $post, $product;
				foreach ( $producten as $item ) {
					$post    = get_post( $item->get_id() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride
					$product = $item;
					setup_postdata( $post );
					wc_get_template_part( 'content', 'product' );
				}
				wp_reset_postdata();
				?>
			</ul>
		</div>
	</section>
<?php endif; ?>

<?php
/* ---------------- het verhaal ---------------- */
$verhaal = get_theme_mod( 'cbr_verhaal', "CurlsbyRuth begon vanuit een eigen zoektocht: producten vinden die écht werken bij krullend haar, zonder eindeloos proberen en teleurstellen.\n\nWat overbleef is dit assortiment — merken die hun plek verdiend hebben. Elke bestelling wordt hier thuis met de hand ingepakt en verstuurd. Geen magazijn, geen tussenpersoon." );
$portret = get_theme_mod( 'cbr_portret' );
$over    = get_page_by_path( 'over-ons' );
?>
<section class="section section--white">
	<div class="wrap">
		<div class="story">
			<div class="story__visual">
				<?php if ( $portret ) : ?>
					<?php echo wp_get_attachment_image( $portret, 'large', false, array( 'alt' => '' ) ); ?>
				<?php else : ?>
					<span class="ph-label">
						<span class="serif">Portretfoto</span>
						<small>Foto van Ruth of de werkplek</small>
					</span>
				<?php endif; ?>
			</div>

			<div class="story__copy">
				<span class="eyebrow">Ons verhaal</span>
				<h2>Het verhaal achter CurlsbyRuth</h2>
				<?php echo wp_kses_post( wpautop( $verhaal ) ); ?>
				<?php if ( $over ) : ?>
					<a class="btn btn--outline" href="<?php echo esc_url( get_permalink( $over ) ); ?>">Lees meer</a>
				<?php endif; ?>
			</div>
		</div>
	</div>
</section>

<?php /* ---------------- waarom deze shop ---------------- */ ?>
<section class="section">
	<div class="wrap">
		<div class="sec-head sec-head--center">
			<span class="eyebrow">Waarom CurlsbyRuth</span>
			<h2>Klein, persoonlijk en eerlijk</h2>
		</div>

		<div class="benefits">
			<div class="benefit">
				<span class="benefit__icon" style="background:var(--brown-soft)">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9C6644" stroke-width="1.6" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
				</span>
				<h3>Zorgvuldig geselecteerd</h3>
				<p>Alleen producten die passen bij krullend en golvend haar.</p>
			</div>

			<div class="benefit">
				<span class="benefit__icon" style="background:var(--clay-soft)">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C0794E" stroke-width="1.6" aria-hidden="true"><path d="M4 8h16v12H4z"/><path d="M4 8l2-4h12l2 4"/><path d="M10 12h4"/></svg>
				</span>
				<h3>Persoonlijke service</h3>
				<p>Met aandacht samengesteld en persoonlijk verpakt.</p>
			</div>

			<div class="benefit">
				<span class="benefit__icon" style="background:var(--sage-soft)">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8FA383" stroke-width="1.6" aria-hidden="true"><path d="M3 13h11v5H3z"/><path d="M14 10h4l3 4v4h-7z"/><circle cx="6.5" cy="18.5" r="1.8"/><circle cx="17" cy="18.5" r="1.8"/></svg>
				</span>
				<h3>Vanuit Nederland</h3>
				<p>Bestellingen worden vanuit Nederland verzonden met PostNL.</p>
			</div>

			<div class="benefit">
				<span class="benefit__icon" style="background:var(--teal-soft)">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F9E9B" stroke-width="1.6" aria-hidden="true"><path d="M12 3c2.6 2.2 2.6 5.3 0 7.5S9.4 16 12 18.5"/><circle cx="12" cy="21" r="1.4" fill="#7F9E9B" stroke="none"/></svg>
				</span>
				<h3>Voor jouw krullen</h3>
				<p>Een assortiment dat volledig gericht is op curly hair.</p>
			</div>
		</div>
	</div>
</section>

<?php
/* ---------------- socials ---------------- */
$ig = get_theme_mod( 'cbr_instagram' );
$tt = get_theme_mod( 'cbr_tiktok' );

if ( $ig || $tt ) :
	?>
	<section class="section section--white">
		<div class="wrap">
			<div class="sec-head sec-head--center" style="margin-bottom:28px">
				<span class="eyebrow">@curlsbyruth</span>
				<h2>Volg CurlsbyRuth</h2>
				<p>Routines, krullentips en wat er nieuw binnenkomt.</p>
			</div>
			<div class="social-links" style="margin-top:0">
				<?php if ( $ig ) : ?>
					<a class="btn btn--outline" href="<?php echo esc_url( $ig ); ?>" rel="noopener">Instagram</a>
				<?php endif; ?>
				<?php if ( $tt ) : ?>
					<a class="btn btn--outline" href="<?php echo esc_url( $tt ); ?>" rel="noopener">TikTok</a>
				<?php endif; ?>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php /* ---------------- nieuwsbrief ---------------- */ ?>
<section class="section">
	<div class="wrap">
		<div class="newsletter">
			<span class="eyebrow">Nieuwsbrief</span>
			<h2>Blijf op de hoogte</h2>
			<p>Ontvang tips, inspiratie en nieuws over CurlsbyRuth. Geen spam, alleen als er echt iets te melden is.</p>
			<form data-newsletter>
				<input type="email" required placeholder="Je e-mailadres" aria-label="E-mailadres" />
				<button class="btn" type="submit">Aanmelden</button>
			</form>
			<span class="newsletter__msg" data-newsletter-msg role="status"></span>
		</div>
	</div>
</section>

<?php
get_footer();
