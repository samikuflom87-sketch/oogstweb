<?php
/**
 * Terugvalpagina voor alles waar geen eigen template voor is.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<div class="wrap wrap--narrow section">
	<?php if ( have_posts() ) : ?>
		<?php while ( have_posts() ) : the_post(); ?>
			<article <?php post_class(); ?>>
				<h1 class="serif"><?php the_title(); ?></h1>
				<div class="rich"><?php the_content(); ?></div>
			</article>
		<?php endwhile; ?>

		<?php the_posts_pagination( array( 'mid_size' => 1 ) ); ?>
	<?php else : ?>
		<h1 class="serif">Niets gevonden</h1>
		<p>Deze pagina bestaat niet of is verplaatst. Ga terug naar <a href="<?php echo esc_url( home_url( '/' ) ); ?>">de homepage</a>.</p>
	<?php endif; ?>
</div>

<?php
get_footer();
