<?php
/**
 * De productpagina. Ruth vroeg om per product: foto, merk, naam, prijs,
 * inhoud, beschrijving, ingrediënten, gebruiksaanwijzing, voorraad en de
 * knop. Dat staat er allemaal, in die volgorde.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

while ( have_posts() ) :
	the_post();
	global $product;

	$merk   = $product->get_attribute( 'merk' );
	$inhoud = $product->get_attribute( 'inhoud' );
	?>

	<div class="section section--tight"><div class="wrap">

		<nav class="kruimels" aria-label="Kruimelpad">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a>
			<span aria-hidden="true">/</span>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Shop</a>
			<span aria-hidden="true">/</span>
			<span aria-current="page"><?php the_title(); ?></span>
		</nav>

		<div id="product-<?php the_ID(); ?>" <?php wc_product_class( 'pd', $product ); ?>>

			<div class="pd__gallery" style="--tegel:<?php echo esc_attr( cbr_merk_zacht( $merk ) ); ?>">
				<?php
				/*
				 * De galerij van WooCommerce zelf: hoofdfoto met de kleinere
				 * foto's eronder, precies zoals in de demo.
				 */
				do_action( 'woocommerce_before_single_product_summary' );
				?>
			</div>

			<div class="pd__summary">

				<?php if ( $merk ) : ?>
					<span class="pd__brand"><?php echo esc_html( $merk ); ?></span>
				<?php endif; ?>

				<h1 class="pd__name serif"><?php the_title(); ?></h1>

				<?php if ( $inhoud ) : ?>
					<span class="pd__size"><?php echo esc_html( $inhoud ); ?></span>
				<?php endif; ?>

				<div class="pd__price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>

				<div class="pd__stock"><?php echo wp_kses_post( wc_get_stock_html( $product ) ); ?></div>

				<?php woocommerce_template_single_add_to_cart(); ?>

				<?php if ( $korte = $product->get_short_description() ) : ?>
					<div class="pd__intro"><?php echo wp_kses_post( wpautop( $korte ) ); ?></div>
				<?php endif; ?>

				<ul class="pd__usps">
					<li>Voor 16:00 besteld, dezelfde dag verstuurd</li>
					<li>Met de hand ingepakt in Nederland</li>
					<li>14 dagen bedenktijd</li>
				</ul>

			</div>

		</div>

		<div class="pd__tabs">
			<?php woocommerce_output_product_data_tabs(); ?>
		</div>

		<?php
		/* Andere producten die erbij passen. */
		woocommerce_output_related_products();
		?>

	</div></div>

	<?php
endwhile;

get_footer();
