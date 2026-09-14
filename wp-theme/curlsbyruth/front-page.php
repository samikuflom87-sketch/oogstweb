<?php
/**
 * De homepage.
 *
 * Opbouw zoals Ruth hem vroeg: grote foto met haar naam en slogan, daaronder
 * de knop naar de shop, dan de merken, dan de producten, dan haar verhaal.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$shop      = cbr_shop_actief();
$hero_id   = get_theme_mod( 'cbr_hero_image' );
$hero_kop  = get_theme_mod( 'cbr_hero_kop', get_bloginfo( 'name' ) );
$hero_sub  = get_theme_mod( 'cbr_hero_sub', 'Your curls, your confidence.' );
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
/* ---- de merken ---- */
$merken = array();
if ( $shop ) {
	$termen = get_terms( array( 'taxonomy' => 'pa_merk', 'hide_empty' => true ) );
	$merken = is_wp_error( $termen ) ? array() : wp_list_pluck( $termen, 'name' );
}

if ( $merken ) :
	?>
	<section class="section section--tight merkenrij">
		<div class="wrap">
			<h2 class="serif merkenrij__kop">De merken die ik voor je uitzoek</h2>
			<ul class="merkenrij__lijst">
				<?php foreach ( $merken as $merk ) : ?>
					<li><?php echo esc_html( $merk ); ?></li>
				<?php endforeach; ?>
			</ul>
		</div>
	</section>
<?php endif; ?>

<?php
/* ---- uitgelichte producten ---- */
$uitgelicht = array();

if ( $shop ) {
	$uitgelicht = wc_get_products(
		array(
			'status'   => 'publish',
			'featured' => true,
			'limit'    => 8,
		)
	);

	if ( empty( $uitgelicht ) ) {
		$uitgelicht = wc_get_products(
			array(
				'status' => 'publish',
				'limit'  => 8,
			)
		);
	}
}

if ( $uitgelicht ) :
	?>
	<section class="section">
		<div class="wrap">
			<div class="sectiekop">
				<h2 class="serif">Onze producten</h2>
				<a class="sectiekop__link" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Bekijk alles</a>
			</div>

			<ul class="products columns-4">
				<?php
				global $post, $product;
				foreach ( $uitgelicht as $item ) {
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
/* ---- het verhaal achter de shop ---- */
$verhaal = get_theme_mod( 'cbr_verhaal' );
$portret = get_theme_mod( 'cbr_portret' );

if ( $verhaal || $portret ) :
	?>
	<section class="section section--white verhaal">
		<div class="wrap verhaal__grid">
			<?php if ( $portret ) : ?>
				<div class="verhaal__foto">
					<?php echo wp_get_attachment_image( $portret, 'large', false, array( 'alt' => '' ) ); ?>
				</div>
			<?php endif; ?>

			<div class="verhaal__tekst">
				<h2 class="serif">Het verhaal achter CurlsbyRuth</h2>
				<?php echo wp_kses_post( wpautop( $verhaal ) ); ?>
				<?php if ( $over = get_page_by_path( 'over-ons' ) ) : ?>
					<a class="btn btn--outline" href="<?php echo esc_url( get_permalink( $over ) ); ?>">Lees meer over mij</a>
				<?php endif; ?>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php
get_footer();
