<?php
/**
 * De productpagina, opgebouwd als in de demo: links de foto's, rechts merk,
 * naam, inhoud, prijs, voorraad en de koopknop, en daaronder de uitklapbare
 * blokken met de omschrijving, de ingrediënten en de gebruiksaanwijzing.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

while ( have_posts() ) :
	the_post();
	global $product;

	$merk      = $product->get_attribute( 'merk' );
	$inhoud    = $product->get_attribute( 'inhoud' );
	$categorie = wc_get_product_category_list( $product->get_id(), ', ', '', '' );
	$categorie = trim( wp_strip_all_tags( $categorie ) );

	/* "Shampoo · 384 ml", net als in de demo. */
	$onder = implode( ' · ', array_filter( array( $categorie, $inhoud ) ) );
	?>

	<div class="wrap">

		<div id="product-<?php the_ID(); ?>" <?php wc_product_class( 'pd', $product ); ?>>

			<div class="pd__gallery" style="--tegel:<?php echo esc_attr( cbr_merk_zacht( $merk ) ); ?>">
				<?php
				/* De galerij van WooCommerce zelf: grote foto met de kleintjes eronder. */
				do_action( 'woocommerce_before_single_product_summary' );
				?>
			</div>

			<div class="pd__info">

				<?php if ( $merk ) : ?>
					<span class="pd__brand"><?php echo esc_html( $merk ); ?></span>
				<?php endif; ?>

				<h1><?php the_title(); ?></h1>

				<?php if ( $onder ) : ?>
					<span class="pd__size"><?php echo esc_html( $onder ); ?></span>
				<?php endif; ?>

				<div class="pd__price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>

				<div class="pd__stock"><?php echo wp_kses_post( wc_get_stock_html( $product ) ); ?></div>

				<?php
				/* Het aantal en de knop; WooCommerce zet ze in één formulier. */
				woocommerce_template_single_add_to_cart();
				?>

				<?php cbr_product_accordeon( $product ); ?>

				<?php if ( $sku = $product->get_sku() ) : ?>
					<p class="pd__sku">Artikelnummer <?php echo esc_html( $sku ); ?></p>
				<?php endif; ?>

			</div>

		</div>

	</div>

	<?php
	/* Andere producten die erbij passen, onderaan en over de volle breedte. */
	woocommerce_output_related_products();
	?>

	<?php
endwhile;

get_footer();
