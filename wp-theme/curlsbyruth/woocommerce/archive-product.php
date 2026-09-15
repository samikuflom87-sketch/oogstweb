<?php
/**
 * De shoppagina, opgebouwd als in de demo: een kop over de volle breedte,
 * daaronder de filterbalk met categorieën, het aantal en de sorteerkeuze,
 * en dan pas het raster met producten.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$categorieen = cbr_categorieen();

/*
 * Komt de bezoeker binnen via de merkenslider, dan staat hij op het archief
 * van dat merk. Dan tonen we bovenaan welk merk dat is, met een weg terug.
 */
$merk_term = is_tax( 'pa_merk' ) ? get_queried_object() : null;
$huidige_cat = get_query_var( 'product_cat' );

if ( ! $huidige_cat && is_product_category() ) {
	$cat_object  = get_queried_object();
	$huidige_cat = $cat_object ? $cat_object->slug : '';
}

/* De chips houden het merk vast waar de bezoeker in zit. */
$basis_url = $merk_term ? get_term_link( $merk_term ) : wc_get_page_permalink( 'shop' );

if ( is_wp_error( $basis_url ) ) {
	$basis_url = wc_get_page_permalink( 'shop' );
}
?>

<section class="page-head">
	<div class="wrap">
		<span class="eyebrow">Assortiment</span>
		<h1><?php woocommerce_page_title(); ?></h1>
		<?php if ( $tekst = get_theme_mod( 'cbr_shop_intro', 'Alles voor het reinigen, verzorgen en stylen van je krullen — zorgvuldig uitgekozen.' ) ) : ?>
			<p><?php echo esc_html( $tekst ); ?></p>
		<?php endif; ?>
	</div>
</section>

<div class="section"><div class="wrap">

	<?php if ( $merk_term ) : ?>
		<div class="shop-merk">
			<span>Merk: <strong><?php echo esc_html( $merk_term->name ); ?></strong></span>
			<a class="link-arrow" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Toon alle merken</a>
		</div>
	<?php endif; ?>

	<div class="shop-bar">

		<div class="chips">
			<a class="chip<?php echo $huidige_cat ? '' : ' active'; ?>" href="<?php echo esc_url( $basis_url ); ?>">Alles</a>
			<?php foreach ( $categorieen as $cat ) : ?>
				<a class="chip<?php echo ( $huidige_cat === $cat['slug'] ) ? ' active' : ''; ?>"
				   href="<?php echo esc_url( add_query_arg( 'product_cat', $cat['slug'], $basis_url ) ); ?>">
					<?php echo esc_html( $cat['naam'] ); ?>
				</a>
			<?php endforeach; ?>
		</div>

		<div class="shop-bar__rechts">
			<?php
			$gevonden = (int) wc_get_loop_prop( 'total' );
			printf(
				'<span class="shop-count">%d %s</span>',
				$gevonden,
				esc_html( 1 === $gevonden ? 'product' : 'producten' )
			);

			woocommerce_catalog_ordering();
			?>
		</div>

	</div>

	<?php if ( woocommerce_product_loop() ) : ?>

		<?php woocommerce_product_loop_start(); ?>

			<?php while ( have_posts() ) : the_post(); ?>
				<?php wc_get_template_part( 'content', 'product' ); ?>
			<?php endwhile; ?>

		<?php woocommerce_product_loop_end(); ?>

		<?php do_action( 'woocommerce_after_shop_loop' ); ?>

	<?php else : ?>

		<div class="empty">
			<h2 class="serif">Hier staat nog niets</h2>
			<p>In deze categorie staan op dit moment geen producten.</p>
			<a class="btn" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Bekijk alles</a>
		</div>

	<?php endif; ?>

</div></div>

<?php
get_footer();
