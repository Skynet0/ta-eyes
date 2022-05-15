import static org.junit.Assert.*;
import org.junit.Test;

public class MultiArrTest {

    @Test
    public void testMaxValue() {
        int[][] arr = {{1,2,3},{2,3,4}};
        int max= 4;
        assertEquals(max, MultiArr.maxValue(arr));
    }

    @Test
    public void testAllRowSums() {
        int[][] arr = {{1,2,3},{2,3,4}};
        int[] sums = {6,9};
        // assertArrayEquals(sums, MultiArr.allRowSums(arr));
        assertEquals(sums, MultiArr.allRowSums(arr));
    }


    /* Run the unit tests in this file. */
    public static void main(String... args) {
        System.exit(ucb.junit.textui.runClasses(MultiArrTest.class));
    }
}
