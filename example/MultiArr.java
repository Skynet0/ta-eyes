/** Multidimensional array 
 *  @author Zephyr Barkan
 */

public class MultiArr {

    /**
    {{“hello”,"you",”world”} ,{“how”,”are”,”you”}} prints:
    Rows: 2
    Columns: 3
    
    {{1,3,4},{1},{5,6,7,8},{7,9}} prints:
    Rows: 4
    Columns: 4
    */
    public static void printRowAndCol(int[][] arr) {
        System.out.println("Rows:" + arr.length);
        System.out.println();
        int cols = 0;
        for (int[] row : arr) {
            cols = row.length > cols ? row.length : cols;
        }
        System.out.println("Columns:" + cols);
    } 

    /**Return the maximal value present anywhere in the array*/
    public static int maxValue(int[][] arr) {
        int max_value = Integer.MIN_VALUE;
        for (int i = 0; i<arr.length; i++) {
            for (int j = 0; j<arr[i].length; j++) {
                if (arr[i][j]>max_value) {
                    max_value = arr[i][j];
                }
            }
        }
        return max_value;
    }

    /**Return an array where each element is the sum of the 
    corresponding row of the array*/
    public static int[] allRowSums(int[][] arr) {
        int[] sums = new int[arr.length];
        int count;
        for (int i = 0;i < arr.length; i++) {
            count = 0;
            for (int j =0;j < arr[i].length; j++) {
                count += arr[i][j];
            }
            sums[i] = count;
        }
        return sums;
    }
}
