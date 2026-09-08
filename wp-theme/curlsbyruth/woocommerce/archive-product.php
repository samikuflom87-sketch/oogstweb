<?php
/**
 * De shoppagina. Ruth wil alle producten bij elkaar, zonder categorieën.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<div class="wrap section section--tight">

	<header class="shop-head">
		<h1 class="serif"><?php woocommerce_page_title(); ?></h1>
		<?php if ( $tekst = get_theme_mod( 'cbr_shop_intro' ) ) : ?>
			<p class="shop-head__intro"><?php echo esc_html( $tekst ); ?></p>
		<?php endif; ?>
	</header>

	<?php if ( woocommerce_product_loop() ) : ?>

		<?php woocommerce_product_loop_start(); ?>

			<?php while ( have_posts() ) : the_post(); ?>
				<?php wc_get_template_part( 'content', 'product' ); ?>
			<?php endwhile; ?>

		<?php woocommerce_product_loop_end(); ?>

		<?php do_action( 'woocommerce_after_shop_loop' ); ?>

	<?php else : ?>
		<p>Er staan op dit moment geen producten in de shop.</p>
	<?php endif; ?>

</div>

<?php
get_footer();
