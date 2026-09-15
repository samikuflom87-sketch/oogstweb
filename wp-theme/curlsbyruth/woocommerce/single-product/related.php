<?php
/**
 * "Vergelijkbare producten" onderaan de productpagina. WooCommerce zet hier
 * standaard een kale lijst neer; in de demo is het een eigen blok op een
 * witte ondergrond met een gecentreerde kop erboven.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( empty( $related_products ) ) {
	return;
}
?>

<section class="section section--white reveal">
	<div class="wrap">

		<div class="sec-head sec-head--center">
			<span class="eyebrow">Misschien ook iets</span>
			<h2>Vergelijkbare producten</h2>
		</div>

		<?php woocommerce_product_loop_start(); ?>

			<?php foreach ( $related_products as $related_product ) : ?>
				<?php
				/*
				 * Allebei de globals zetten. WooCommerce vult $product normaal
				 * via de 'the_post'-actie, en die komt hier niet langs — zonder
				 * deze regel toont elke kaart het product waar je al op staat.
				 */
				$GLOBALS['post']    = get_post( $related_product->get_id() );
				$GLOBALS['product'] = $related_product;

				setup_postdata( $GLOBALS['post'] );

				wc_get_template_part( 'content', 'product' );
				?>
			<?php endforeach; ?>

		<?php woocommerce_product_loop_end(); ?>

	</div>
</section>

<?php
wp_reset_postdata();
