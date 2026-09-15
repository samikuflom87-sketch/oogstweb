<?php
/**
 * De koopregel op de productpagina: het aantal met een min en een plus, en
 * daarnaast de knop. WooCommerce levert standaard alleen een kaal invoervak
 * zonder knoppen; in de demo staan ze er wel, en op een telefoon is dat het
 * verschil tussen wel en niet kunnen wijzigen.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $product;

if ( ! $product->is_purchasable() ) {
	return;
}

/* De voorraadregel staat al boven de prijs, in .pd__stock. */

if ( ! $product->is_in_stock() ) {
	return;
}

do_action( 'woocommerce_before_add_to_cart_form' );
?>

<form class="cart pd__buy" action="<?php echo esc_url( apply_filters( 'woocommerce_add_to_cart_form_action', $product->get_permalink() ) ); ?>" method="post" enctype="multipart/form-data">

	<?php do_action( 'woocommerce_before_add_to_cart_button' ); ?>

	<?php if ( ! $product->is_sold_individually() ) : ?>
		<div class="qty">
			<button type="button" class="qty__min" aria-label="Eén minder">&minus;</button>
			<?php
			woocommerce_quantity_input(
				array(
					'min_value'   => apply_filters( 'woocommerce_quantity_input_min', $product->get_min_purchase_quantity(), $product ),
					'max_value'   => apply_filters( 'woocommerce_quantity_input_max', $product->get_max_purchase_quantity(), $product ),
					'input_value' => isset( $_POST['quantity'] ) ? wc_stock_amount( wp_unslash( $_POST['quantity'] ) ) : $product->get_min_purchase_quantity(), // phpcs:ignore WordPress.Security.NonceVerification.Missing
				)
			);
			?>
			<button type="button" class="qty__plus" aria-label="Eén meer">+</button>
		</div>
	<?php endif; ?>

	<button type="submit" name="add-to-cart" value="<?php echo esc_attr( $product->get_id() ); ?>" class="btn single_add_to_cart_button">
		<?php echo esc_html( $product->single_add_to_cart_text() ); ?>
	</button>

	<?php do_action( 'woocommerce_after_add_to_cart_button' ); ?>

</form>

<?php do_action( 'woocommerce_after_add_to_cart_form' ); ?>
